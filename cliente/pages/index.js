/**
 * This script is modified OpenAI's Quickstart example: https://platform.openai.com/docs/quickstart
 * */

import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";

export default function Home() {
  const charLimit = 1000;
  const [scrapeTarget, setScrapeTarget] = useState("");
  const [scrapedTextInput, setScrapedTextInput] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [result, setResult] = useState();
  const [charCount, setCharCount] = useState();
  
  //scrape website
  async function onScrape(event) {
    event.preventDefault();
    setScrapedTextInput("");
    try {
      //get content
      const serverUrl = await getServer();
      const apiUrl = `${serverUrl}/api/scraper?url=${encodeURIComponent(scrapeTarget)}`;
      const response = await fetch(apiUrl);
      const result = await response.json();

      if (response.ok) {
        let scapedValue = '';
        //convert first charLimit characters of json to text
        Object.keys(result).forEach((key) => {
          const news = `${result[key]}\n\n`;
          if (scapedValue.length + news.length > charLimit) {
            return true;
          }
          scapedValue += `${result[key]}\n\n`;
        });

        //assign text to textarea
        setScrapedTextInput(scapedValue);
      } else {
        console.error(result.error || 'An error occurred');
      }
    } catch (error) {
      console.error(error);
    }
  }

  //call gpt
  async function onSummarize(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scrapedText: scrapedTextInput, hashtags: hashtags }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      setResult(data.result);
      setCharCount(`${data.result.length} characters`);
      setScrapedTextInput("");
    } catch(error) {
      console.error(error);
      alert(error.message);
    }
  }

  //get server location
  async function getServer() {
    try {
      const response = await fetch("/api/server", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Server fetching failed with status ${response.status}`);
      }

      return data.server;
    } catch(error) {
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
        <p>Scraped text is currently capped at {charLimit} characters.</p>
        <form onSubmit={onSummarize}>
          <textarea
            name="scrapedText"
            placeholder="Enter text"
            value={scrapedTextInput}
            onChange={(e) => setScrapedTextInput(e.target.value)}
            rows={10} // Added rows attribute here
          />
          <p>Hashtags</p>
          <input
            type="text"
            name="hashtags"
            placeholder="Hashtags you want to use"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
          />
          <br />
          <input type="submit" value="Tweetize" />
        </form>
        <div className={styles.result}>{result}</div>
        <div className={styles.result}>{charCount}</div>
      </main>
    </div>
  );
}
