import express from 'express'
import { GoogleGenerativeAI } from '@google/generative-ai'
import 'dotenv/config'


const router = express.Router()
const app = express()
app.use(express.json())
const port = 3000

//Gemini
const geminiAppKey =  process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiAppKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })


const apiKey =  process.env.GOOGLE_API_KEY;
const baseUrl = "https://www.googleapis.com/books/v1"




app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


// app.post('/', async (req, res) => {
   
//     const apik = process.env.API_KEY
//     res.send({
//         apiKey: apiKey,
//         geminiAppKey: geminiAppKey
//     })

//     // console.log(bookResponse);
// })

app.post('/libro', async (req, res) => {
    const { libro1, libro2 } = req.body
    // const data =  req.body

    const datalibro1 = await obtenerDescripcionAsync(libro1).catch((e)=> console.error(e))
    if(!datalibro1) {
        // throw new Error(`No fue posible encontrar información sobre "${libro1}"`);
        res.status(400).send({msg: `No fue posible encontrar información sobre "${libro1}"`})
        return;
    }
    
    
    const datalibro2 = await obtenerDescripcionAsync(libro2).catch((e)=>res.send(e))
    if(!datalibro2) {
        res.status(400).send({msg: `No fue posible encontrar información sobre "${libro2}"`})
        return;
    }
    
    const resumen = await obtenerResumenAsync(libro1, datalibro1.join(';'), libro2, datalibro2).catch((e)=>res.send(e))
    res.send(resumen)

    // console.log(bookResponse);
})

async function obtenerDescripcionAsync(nombreLibro) {

    const libroData = await fetch(`${baseUrl}/volumes?q=${nombreLibro}&key=${apiKey}`)
        .then(response => {
            if(response.ok) return response.json();
        })
        .then(data => {
            return data
        })
        .catch((e)=> {
            console.log('error al cargar:', nombreLibro);
            throw e
        })

    if(!libroData) return;
    return libroData.items?.map((d) => { return (d.volumeInfo.description) })

}

app.get('/gemini/:prompt', async (req, res) => {
    const prompt = req.params.prompt

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.send(text)
})

async function obtenerResumenAsync(nombreLibro1, descripciones1, nombreLibro2, descripciones2) {
    // const prompt = `Toma esta coleccion de sintesis de ${nombreLibro1}: "${descripciones1}" y esta de ${nombreLibro2}: ${descripciones2} y usalas para crear una nueva historia de dos párrafos donde los personajes de ${nombreLibro2} sean los antagonistas de ${nombreLibro1}`
    const prompt = `Toma esta coleccion de sintesis de ${nombreLibro1}: "${descripciones1}" y esta de ${nombreLibro2}: ${descripciones2} y usalas para crear una nueva historia de dos párrafos donde los personajes y/o conceptos de un libro sean antagonistas del otro`
    console.log(prompt);
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
}