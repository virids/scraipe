import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const [scrapeTarget, setScrapeTarget] = useState("");
  const [scrapedTextInput, setScrapedTextInput] = useState("");
  const [result, setResult] = useState();
  const [charCount, setCharCount] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scrapedText: scrapedTextInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      //console.log(data.result);
      setResult(data.result);
      setCharCount(`${data.result.length} characters`);
      setScrapedTextInput("");
    } catch(error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    }
  }

  async function onScrape(event) {
    event.preventDefault();
    setScrapedTextInput("");
    try {
      const serverUrl = 'https://scraipe-serv.vercel.app';
      const apiUrl = `${serverUrl}/api/scraper?url=${encodeURIComponent(scrapeTarget)}`;

      console.log('API URL:', apiUrl); // Log the apiUrl


      const response = await fetch(apiUrl);

      console.log('Response:', response); // Log the response object

      
      const result = await response.json();

      if (response.ok) {
        let scapedValue = '';
        Object.keys(result).forEach((key) => {
          const news = `${result[key]}\n\n`;
          if (scapedValue.length + news.length > 2000) {
            return true
          }
          scapedValue += `${result[key]}\n\n`;
        });
        setScrapedTextInput(scapedValue);
      } else {
        console.error(result.error || 'An error occurred');
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div>
      <Head>
        <title>Scraipe</title>
      </Head>

      <main className={styles.main}>
        <h3>scraipe</h3>
        <form onSubmit={onScrape}>
          <input
            type="url"
            name="scrapeTarg"
            placeholder="Enter url"
            value={scrapeTarget}
            onChange={(e) => setScrapeTarget(e.target.value)}
          />
          <input type="submit" value="Scrape" />
        </form>
        <p>Scraped text is currently capped at 2000 characters.</p>
        <form onSubmit={onSubmit}>
          <textarea
            name="scrapedText"
            placeholder="Enter text"
            value={scrapedTextInput}
            onChange={(e) => setScrapedTextInput(e.target.value)}
            rows={10} // Added rows attribute here
          />
          <br />
          <input type="submit" value="Summarize" />
        </form>
        <div className={styles.result}>{result}</div>
        <div className={styles.result}>{charCount}</div>
      </main>
    </div>
  );
}
