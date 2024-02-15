import express from "express"
import db from "./db.js";
import multer from 'multer';
import fs from "fs"
import path from "path"

const newsRoutes = express.Router();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/myUploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

const multipleUploads = upload.fields([{ name: "image_url" }, { name: "pdf_url" }])

newsRoutes.get('/', async (req, res) => {
    try {
        const [results] = await db.execute('SELECT * FROM newsletter');
        res.json(results);
    } catch (err) {
        console.error('Error fetching data from reports:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }

});

newsRoutes.get('/data/:title', async (req, res) => {
    try {
        const { title } = req.params;


        const [rows] = await db.execute('SELECT * FROM newsletter WHERE title = ?', [title]);

        if (rows.length > 0) {
            res.json(rows[0]);
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


newsRoutes.post("/upload", multipleUploads, async (req, res) => {
    try {
        const { image_url, pdf_url } = req.files;
        const payload = req.body;

        const created_date = new Date();

        const modifiedBy = "admin"

        const createdBy = "admin"

        const modified_date=null;
       
        const [results] = await db.execute('INSERT INTO newsletter (title, image_url, created_date, modified_date, created_by, modified_by, pdf_url) VALUES (?, ?, ?, ?, ?, ?, ?)', [
            payload.title,
            image_url[0].filename,
            created_date,
            modified_date,
            createdBy,
            modifiedBy,
           pdf_url[0].filename,
        ]);
        res.json({ message: 'Form submitted successfully', formId: results });
    } catch (error) {
        console.error('Error submitting form:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }

})


newsRoutes.put('/update/:id',multipleUploads, async (req, res) => {
    try {
        const { id } = req.params;
        const { image_url, pdf_url } = req.files;
        const newData = req.body;

        newData.modified_date = Date.now();

        const [results] = await db.execute(`UPDATE newsletter
            SET title = ?, image_url = ?, modified_date = ?, pdf_url = ? 
            WHERE id = ?`, [
                newData.title,
                image_url[0].filename,
                newData.modified_date,
                pdf_url[0].filename,
                id
            ]);

        if (results.affectedRows > 0) {
            res.json({ message: 'Data updated successfully' });
        } else {
            res.status(404).json({ error: 'Data not found' });
        }
    } catch (error) {
        console.error('Error updating data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


newsRoutes.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params
        const [rows] = await db.execute('SELECT pdf_url FROM newsletter WHERE id = ?', [id]);
        const pdfPath = `public/myUploads/${rows[0].pdf_url}`
        const imagePath = `public/myUploads/${rows[0].image_url}`
        await db.execute(`DELETE FROM newsletter WHERE id = ${id}`)
        fs.unlink(pdfPath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully.');
            }
        })
        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully.');
            }
        })
        res.json({ message: "recorded and deleted successfully" })
    } catch (err) {
        console.error('Error submitting form:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
})



export default newsRoutes