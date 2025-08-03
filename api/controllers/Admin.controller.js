import { handleError } from "../helpers/handleError.js"
import User from "../models/user.model.js"
import Blog from "../models/blog.model.js"
import Category from "../models/category.model.js"
import Like from "../models/like.model.js"
import Comment from "../models/comment.model.js"
import { createObjectCsvWriter } from 'csv-writer'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx'
import * as XLSX from 'xlsx'
import PDFDocument from 'pdfkit-table'

export const getDashboardData = async (req, res, next) => {
    try {
        // Get total counts
        const totalBlogs = await Blog.countDocuments()
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } })
        const totalCategories = await Category.countDocuments()
        const totalLikes = await Like.countDocuments()

        // Get blogs by category
        const categoryData = await Blog.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
            { $unwind: '$category' },
            { $project: { name: '$category.name', count: 1, _id: 0 } }
        ])

        // Get user registration trend (last 6 months)
        //The number of users created in each month for the past 6 months 
        // (including the current month), excluding admins.

        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const userTrendData = await User.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo }, role: { $ne: 'admin' } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
            { $project: { month: '$_id', count: 1, _id: 0 } },
            { $sort: { month: 1 } }
        ])

        res.status(200).json({
            stats: {
                totalBlogs,
                totalUsers,
                totalCategories,
                totalLikes
            },
            categoryData,
            userTrendData
        })
    } catch (error) {
        next(handleError(500, error.message))
    }
}

export const downloadReport = async (req, res, next) => {
    try {
        const { type, format } = req.params

        // Validate type and format
        if (!['category', 'user', 'blog'].includes(type)) {
            return next(handleError(400, 'Invalid report type'))
        }
        if (!['pdf', 'excel', 'word'].includes(format)) {
            return next(handleError(400, 'Invalid report format'))
        }

        // Get data based on type
        let data, headers
        switch (type) {
            case 'category':
                data = await Category.find().lean()
                headers = ['Name', 'Slug', 'Created At']
                break
            case 'user':
                data = await User.find({ role: { $ne: 'admin' } })
                    .select('-password')
                    .lean()
                headers = ['Name', 'Email', 'Role', 'Created At']
                break
            case 'blog':
                data = await Blog.find()
                    .populate('author', 'name')
                    .populate('category', 'name')
                    .lean()
                headers = ['Title', 'Author', 'Category', 'Created At']
                break
        }

        // Format data based on type
        const formattedData = data.map(item => {
            switch (type) {
                case 'category':
                    return {
                        Name: item.name,
                        Slug: item.slug,
                        'Created At': new Date(item.createdAt).toLocaleDateString()
                    }
                case 'user':
                    return {
                        Name: item.name,
                        Email: item.email,
                        Role: item.role,
                        'Created At': new Date(item.createdAt).toLocaleDateString()
                    }
                case 'blog':
                    return {
                        Title: item.title,
                        Author: item.author.name,
                        Category: item.category.name,
                        'Created At': new Date(item.createdAt).toLocaleDateString()
                    }
            }
        })

        // Generate file based on format
        let fileBuffer
        const fileName = `${type}-report.${format === 'excel' ? 'xls' : format === 'word' ? 'doc' : 'pdf'}`

        switch (format) {
            case 'excel':
                const ws = XLSX.utils.json_to_sheet(formattedData)
                const wb = XLSX.utils.book_new()
                XLSX.utils.book_append_sheet(wb, ws, 'Sheet1')
                fileBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xls' })
                res.setHeader('Content-Type', 'application/vnd.ms-excel; charset=utf-8')
                res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xls`)
                res.send(fileBuffer)
                return

            case 'word':
                const doc = new Document({
                    sections: [{
                        properties: {},
                        children: [
                            // Header
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'BlogHub',
                                        bold: true,
                                        size: 28,
                                        color: '2B579A'
                                    })
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: {
                                    after: 200
                                }
                            }),
                            // Title
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
                                        bold: true,
                                        size: 24
                                    })
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: {
                                    after: 200
                                }
                            }),
                            // Table
                            new Table({
                                width: {
                                    size: 100,
                                    type: WidthType.PERCENTAGE
                                },
                                rows: [
                                    new TableRow({
                                        children: headers.map(header => 
                                            new TableCell({
                                                children: [new Paragraph({
                                                    children: [new TextRun({
                                                        text: header,
                                                        bold: true
                                                    })]
                                                })],
                                                width: {
                                                    size: 100 / headers.length,
                                                    type: WidthType.PERCENTAGE
                                                }
                                            })
                                        )
                                    }),
                                    ...formattedData.map(row => 
                                        new TableRow({
                                            children: Object.values(row).map(value => 
                                                new TableCell({
                                                    children: [new Paragraph(value.toString())]
                                                })
                                            )
                                        })
                                    )
                                ]
                            }),
                            // Footer
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: 'BlogHub - Your Blogging Platform',
                                        color: '2B579A'
                                    })
                                ],
                                alignment: AlignmentType.CENTER,
                                spacing: {
                                    before: 200
                                }
                            })
                        ]
                    }]
                })
                fileBuffer = await Packer.toBuffer(doc)
                res.setHeader('Content-Type', 'application/msword; charset=utf-8')
                res.setHeader('Content-Disposition', `attachment; filename=${type}-report.doc`)
                res.send(fileBuffer)
                return

            case 'pdf':
                return new Promise((resolve, reject) => {
                    const pdfDoc = new PDFDocument({
                        size: 'A4',
                        margin: 50
                    })
                    const chunks = []
                    
                    pdfDoc.on('data', chunk => chunks.push(chunk))
                    pdfDoc.on('end', () => {
                        const fileBuffer = Buffer.concat(chunks)
                        res.setHeader('Content-Type', 'application/pdf')
                        res.setHeader('Content-Disposition', `attachment; filename=${type}-report.pdf`)
                        res.send(fileBuffer)
                        resolve()
                    })
                    pdfDoc.on('error', reject)

                    // Header
                    pdfDoc.font('Helvetica-Bold')
                        .fontSize(24)
                        .fillColor('#2B579A')
                        .text('BlogHub', { align: 'center' })
                        .moveDown()

                    // Title
                    pdfDoc.fontSize(20)
                        .fillColor('#000000')
                        .text(`${type.charAt(0).toUpperCase() + type.slice(1)} Report`, { align: 'center' })
                        .moveDown(2)

                    // Table
                    const table = {
                        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
                        headers: headers,
                        rows: formattedData.map(row => Object.values(row))
                    }

                    pdfDoc.table(table, {
                        prepareHeader: () => pdfDoc.font('Helvetica-Bold').fontSize(12),
                        prepareRow: () => pdfDoc.font('Helvetica').fontSize(10),
                        width: pdfDoc.page.width - 100,
                        x: 50,
                        y: pdfDoc.y
                    })

                    // Footer
                    pdfDoc.font('Helvetica-Bold')
                        .fontSize(12)
                        .fillColor('#2B579A')
                        .text('BlogHub - Your Blogging Platform', pdfDoc.page.width / 2, pdfDoc.page.height - 50, {
                            align: 'center'
                        })

                    pdfDoc.end()
                })
        }
    } catch (error) {
        next(handleError(500, error.message))
    }
} 