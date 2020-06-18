const express = require('express')
const router = express.Router()
const Book = require('../models/book')
const Author = require('../models/author')

const imageMineTypes = ['image/jpeg', 'image/png', 'image/gif']

// All Books Route
router.get('/', async (req,res) => {
    let query = Book.find()
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title' , new RegExp(req.query.title , 'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate' , req.query.publishedBefore)
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate' , req.query.publishedAfter)
    }

    try {
        const books = await query.exec()
        res.render('books/index' , {
            books : books,
            searchOptions : req.query
        })
    } catch (error) {
        res.redirect('/')
    }
})

// New Book Route
router.get('/new',async (req,res) => {
    renderFormPage(res, new Book(), 'new')
})

// Create Book Route
router.post('/',async (req,res) => {
    const book = new Book({
        title : req.body.title,
        description : req.body.description,
        publishDate : new Date(req.body.publishDate),
        pageCount : req.body.pageCount,
        author : req.body.author
    })
    saveCoverImage(book, req.body.cover)

    try { 
        const newBook = await book.save()
        res.redirect(`/books/${newBook.id}`)
    } catch (error) {
        renderFormPage(res, book,'new', true)
    }
})

// Show Book Route
router.get('/:id' , async (req,res) => {
    try {
        const book = await Book.findById(req.params.id).populate('author').exec()
        res.render('books/show' , {book:book})
    } catch (error) {
        res.redirect('/')
    }
})

// Edit Book Route
router.get('/:id/edit', async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        renderFormPage(res, book, 'edit')
    } catch (error) {
        res.redirect('/')
    } 
})

// Update Book Route
router.put('/:id', async (req,res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title=req.body.title
        book.description=req.body.description
        book.publishDate=new Date(req.body.publishDate)
        book.pageCount=req.body.pageCount
        book.author=req.body.author
        if(req.body.cover != null && req.body.cover !==''){
            saveCoverImage(book,req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch {
        if(book != null){
            renderFormPage(res,book,'edit',true)
        }else{
            res.redirect('/')
        }
    }
})

// Delete Book Route
router.delete('/:id' , async (req, res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect('/books')
    } catch (error) {
        if(book != null){
            res.render(`books/show` , {
                book:book,
                errorMessage : 'Error When Deleting Book'})
        }else{
            res.redirect('/')
        }
    }
})



// FUNCTIONS
function saveCoverImage(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMineTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data,'base64')
        book.coverImageType = cover.type
    }
}

async function renderFormPage(res, book, form, hasError = false){
    try {
        const authors = await Author.find({})

        const params = {
            authors : authors,
            book : book
        }
        if(hasError) params.errorMessage = form == 'new' ? 'Error When Creating Book' : 'Error When Editing Book'

        res.render(`books/${form}`, params)
    } catch (error) {
        res.redirect('/books')
    }
}

module.exports = router