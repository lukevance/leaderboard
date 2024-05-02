require('dotenv').config()
const express = require('express')
const app = express()
const port = 3000
const { Client } = require("@notionhq/client")
const { subDays, formatISO } = require('date-fns')

// Initializing a client
console.info(process.env.Notion)
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.get('/results', async (req, res) => {
  try {
    const thirtyDaysAgo = formatISO(subDays(new Date(), 30), { representation: 'date' });
    
    // Fetch items from the Notion database
    const response = await notion.databases.query({
      database_id: process.env.EVENT_DB_ID,
      filter: {
        property: 'Date',
        date: {
          after: thirtyDaysAgo
        }
      }
    });

    // Process the response and add additional data
    const items = response.results.map(item => ({
      id: item.id,
      title: item.properties.Name.title[0].text.content,
      date: item.properties.Date.date.start
      // Add other properties as needed
    }));

    // Return the processed items to the frontend
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});