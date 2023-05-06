/**
 * This script is based on OpenAI's Quickstart example: https://platform.openai.com/docs/quickstart
 * */

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
//console.log(serverUrl)
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const scrapedText = req.body.scrapedText || '';
  const hashtags = req.body.hashtags || '';
  if (scrapedText.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid text.",
      }
    });
    return;
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      //messages: [{role: "user", content: "Hello world"}],
      messages: [{role: "user", content: generatePrompt(scrapedText, hashtags)}],
      //prompt: generatePrompt(scrapedText),
      temperature: 0.7,
      max_tokens: 100,
      presence_penalty: 1,
    });
    res.status(200).json({ result: completion.data.choices[0].message.content });
  } catch(error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: `Error with OpenAI API request: ${error.message}`,
        }
      });
    }
  }
}

function generatePrompt(scrapedText, hashtags) {
  const hashtagQuery = (hashtags != "") ? `Add these hashtags "${hashtags}", but don't use any others.` : `Don't use any hashtags.`;
  return `I have an excerpt from my website, and need you to transform it into an effective tweet. You must not use double-quotes. ${hashtagQuery}
  Here's the excerpt:  
  ${scrapedText}`;
}
