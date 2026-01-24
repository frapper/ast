import express from 'express'
import { schoolDb, School } from '../schoolDb.js'
import axios from 'axios'
import csv from 'csv-parser'
import { Readable } from 'stream'
import multer from 'multer'
import { apiLogger, logger } from '../logger.js'

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter(_req, file, cb) {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
      cb(null, true)
    } else {
      cb(new Error('Only CSV files are allowed'))
    }
  }
})

const router = express.Router()

// GET /api/schools - Get all schools
router.get('/', (_req, res) => {
  apiLogger.request('GET', '/api/schools')
  try {
    const schools = schoolDb.getAll()
    apiLogger.response('GET', '/api/schools', 200, { count: schools.length })
    res.json({ schools, count: schools.length })
  } catch (error) {
    apiLogger.error('GET', '/api/schools', error as Error)
    res.status(500).json({ error: 'Failed to fetch schools' })
  }
})

// POST /api/schools/refresh - Fetch and parse CSV from remote URL
router.post('/refresh', async (_req, res) => {
  apiLogger.request('POST', '/api/schools/refresh')
  try {
    const csvUrl = 'https://catalogue.data.govt.nz/dataset/c1923d33-e781-46c9-9ea1-d9b850082be4/resource/4b292323-9fcc-41f8-814b-3c7b19cf14b3/download/schooldirectory-02-01-2026-074519.csv'

    // Fetch CSV from remote URL
    logger.info('Fetching CSV from remote URL', { url: csvUrl })
    const response = await axios.get(csvUrl, { responseType: 'arraybuffer' })

    // Parse CSV data
    const schools: School[] = []
    const csvData = response.data.toString()

    // Parse CSV
    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from([csvData])
      stream
        .pipe(csv())
        .on('data', (row) => {
          // Map CSV columns to database schema
          const school: School = {
            school_id: row['School Id'] || row['Org_Code'] || '',
            school_name: row['School Name'] || '',
            address: row['Address'] || '',
            suburb: row['Suburb'] || '',
            town: row['Town'] || '',
            postcode: row['Postcode'] || '',
            phone: row['Phone'] || '',
            email: row['Email'] || '',
            website: row['Website'] || '',
            principal: row['Principal'] || '',
            school_type: row['School Type'] || '',
            authority: row['Authority'] || '',
            decile: row['Decile'] ? parseInt(row['Decile']) || 0 : 0,
            roll_number: row['Roll Number'] || row['Total'] ? parseInt(row['Roll Number'] || row['Total']) || 0 : 0,
            gender: row['Gender'] || '',
            is_primary: row['IsPrimary'] ? (row['IsPrimary'].toLowerCase() === 'yes' ? 1 : 0) : 0,
            is_secondary: row['IsSecondary'] ? (row['IsSecondary'].toLowerCase() === 'yes' ? 1 : 0) : 0,
            iscomposite: row['IsComposite'] ? (row['IsComposite'].toLowerCase() === 'yes' ? 1 : 0) : 0,
            org_code: row['Org_Code'] || '',
            特区: row['特区'] || '',
            local_body: row['Local Body'] || ''
          }

          // Only add schools with valid names
          if (school.school_name) {
            schools.push(school)
          }
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error))
    })

    // Clear existing schools and insert new data
    schoolDb.deleteAll()
    schoolDb.insertMany(schools)

    res.json({
      success: true,
      message: `Successfully loaded ${schools.length} schools`,
      count: schools.length
    })
    apiLogger.response('POST', '/api/schools/refresh', 200, { count: schools.length })
  } catch (error) {
    apiLogger.error('POST', '/api/schools/refresh', error as Error)
    res.status(500).json({
      error: 'Failed to refresh schools',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// POST /api/schools/upload - Upload and parse CSV file
router.post('/upload', upload.single('csvFile'), async (req, res) => {
  apiLogger.request('POST', '/api/schools/upload', { filename: req.file?.originalname })
  try {
    if (!req.file) {
      apiLogger.response('POST', '/api/schools/upload', 400, { error: 'No file uploaded' })
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const fs = await import('fs')
    const csvData = fs.readFileSync(req.file.path, 'utf-8')

    // Clean up uploaded file
    fs.unlinkSync(req.file.path)

    // Parse CSV data
    const schools: School[] = []
    let rowCount = 0
    let firstRowKeys: string[] = []

    await new Promise<void>((resolve, reject) => {
      const stream = Readable.from([csvData])
      stream
        .pipe(csv())
        .on('data', (row) => {
          rowCount++
          if (rowCount === 1) {
            firstRowKeys = Object.keys(row)
            logger.info('CSV columns found:', { columns: firstRowKeys })
          }

          // Map CSV columns to database schema - using actual column names from the file
          // Remove BOM from keys if present (﻿School_Id)
          const getRowValue = (key: string) => {
            const value = row[key]
            if (value !== undefined) return value
            // Try with BOM prefix
            const bomKey = `\uFEFF${key}`
            return row[bomKey]
          }

          const school: School = {
            school_id: getRowValue('School_Id') || '',
            school_name: getRowValue('Org_Name') || '',
            address: getRowValue('Add1_Line1') || '',
            suburb: getRowValue('Add1_Suburb') || '',
            town: getRowValue('Add1_City') || '',
            postcode: getRowValue('Add2_Postal_Code') || '',
            phone: getRowValue('Telephone') || '',
            email: getRowValue('Email') || '',
            website: getRowValue('URL') || '',
            principal: getRowValue('Contact1_Name') || '',
            school_type: getRowValue('Org_Type') || '',
            authority: getRowValue('Authority') || '',
            decile: getRowValue('EQi_Index') ? parseInt(getRowValue('EQi_Index')) || 0 : 0,
            roll_number: getRowValue('Total') ? parseInt(getRowValue('Total')) || 0 : 0,
            gender: getRowValue('CoEd_Status') || '',
            is_primary: 0,
            is_secondary: 0,
            iscomposite: 0,
            org_code: getRowValue('School_Id') || '',
            特区: getRowValue('Takiwā') || '',
            local_body: getRowValue('Territorial_Authority') || ''
          }

          // Only add schools with valid names
          if (school.school_name) {
            schools.push(school)
          }
        })
        .on('end', () => resolve())
        .on('error', (error) => reject(error))
    })

    logger.info(`CSV parsing complete: ${rowCount} rows read, ${schools.length} schools parsed`)

    // Clear existing schools and insert new data
    schoolDb.deleteAll()
    schoolDb.insertMany(schools)

    res.json({
      success: true,
      message: `Successfully loaded ${schools.length} schools from uploaded file`,
      count: schools.length
    })
    apiLogger.response('POST', '/api/schools/upload', 200, { count: schools.length })
  } catch (error) {
    apiLogger.error('POST', '/api/schools/upload', error as Error)

    // Clean up uploaded file if it exists
    if (req.file && req.file.path) {
      try {
        const fs = await import('fs')
        fs.unlinkSync(req.file.path)
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    res.status(500).json({
      error: 'Failed to process uploaded file',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// DELETE /api/schools - Delete all schools
router.delete('/', (_req, res) => {
  apiLogger.request('DELETE', '/api/schools')
  try {
    schoolDb.deleteAll()
    apiLogger.response('DELETE', '/api/schools', 200)
    res.json({ success: true, message: 'All schools deleted' })
  } catch (error) {
    apiLogger.error('DELETE', '/api/schools', error as Error)
    res.status(500).json({ error: 'Failed to delete schools' })
  }
})

export default router
