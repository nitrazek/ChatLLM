import { SenderType } from "./enums/sender_type";
import { ChatMessage } from "./models/chat_message";

export const getRagTemplate = (question: string, context: string, messages: ChatMessage[]) => {
    const messagesString = messages.map((message: ChatMessage) => {
        switch(message.sender) {
            case SenderType.AI: return `Answer: ${message.content}`;
            case SenderType.HUMAN: return `Question: ${message.content}`;
        }
    }).join("\n");

    const prompt = `
        You are an expert AI specialized in retrieval-augmented generation. You use both provided knowledge and external resources to answer queries with clarity and precision.
        Answer in form of only one or two sentences.

        ## CONTEXT ##
        ${context}

        ## MESSAGE HISTORY ##
        ${messagesString}

        ## QUESTION ##
        ${question}
    `;

    return prompt;
}

export const getOnlyRagTemplate = (question: string, context: string, messages: ChatMessage[]) => {
    const messagesString = messages.slice(-2).map((message: ChatMessage) => {
        switch(message.sender) {
            case SenderType.AI: return `Answer: ${message.content}`;
            case SenderType.HUMAN: return `Question: ${message.content}`;
        }
    }).join("\n");

    const prompt = `
        You are an expert AI specialized in retrieval-augmented generation. You use provided knowledge to answer queries with clarity and precision.
        Answer received question in those steps:
        1. If the context is empty, reply with "Not enough information. Please provide more details."
        2. Use the most relevant details from the provided context or message history. Ignore irrelevant or contradictory details.
        Answer in form of only one or two sentences.

        ## CONTEXT ##
        ${context}

        ## MESSAGE HISTORY ##
        ${messagesString}

        ## QUESTION ##
        ${question}
    `;

    return prompt;
};

export const getSummaryPrompt = (text: string) => `
    You are a summary-generating assistant that can only return three-word summaries. Read the provided text and summarize it into exactly three words. Follow this process:
    1. Analyze the key points and central themes of the text
    2. Condense the content into a concise, three-word summary that captures the main idea.
    3. Only show final summary, don't be descriptive about it.

    Example:
    - Given answer: "The project aims to develop a predictive model for customer churn, utilizing machine learning techniques and data analysis to identify at-risk customers."
    - Output: "Predictive churn model."

    Text: ${text}
`;