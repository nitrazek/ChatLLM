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
        You are a customer support agent, helping clients by following directives and answering questions. Generate your response by following the steps below:
        1. Detect the language of the post and ensure that your response is in the same language. For example: English, Polish etc.
        2. Recursively break-down the post into smaller questions/directives.
        3. For each atomic question/directive:
        3a. Select the most relevant information from the context in light of the conversation history.
        4. Generate a draft response using the selected information, whose brevity/detail are tailored to the poster’s expertise.
        5. Remove duplicate content from the draft response.
        6. Generate your final response after adjusting it to increase accuracy and relevance.
        
        ## CONTEXT ##
        ${context}

        ## MESSAGE_HISTORY ##  
        ${messagesString}  

        ## QUESTION ## 
        ${question}  

        ## ADDITIONAL INFORMATION ##
        Use information from CONTEXT to maximize relevance and accuracy. If information in CONTEXT isn't sufficient, use MESSAGE_HISTORY.
    `;

    return prompt;
}

export const getOnlyRagTemplate = (question: string, context: string, messages: ChatMessage[]) => {
    const messagesString = messages.map((message: ChatMessage) => {
        switch(message.sender) {
            case SenderType.AI: return `Answer: ${message.content}`;
            case SenderType.HUMAN: return `Question: ${message.content}`;
        }
    }).join("\n");

    const prompt = `
        You are an assistant for retrieving and summarizing information from a knowledge base. Follow these steps:  

        1. **Language Detection:** Detect the language of the question and respond in the same language.  
        2. **Check Context:** If the context is empty, reply with "Not enough information. Please provide more details."  
        3. **Analyze the Question:** If the question is complex, break it into smaller parts. Otherwise, proceed directly to the next step.  
        4. **Retrieve Relevant Information:** For each question or part:  
        a. Use the most relevant details from the provided context or message history.  
        b. Ignore irrelevant or contradictory details.  
        5. **Generate the Answer:** Combine the retrieved information into a concise, accurate, and informative response.
        6. **Show The Answer:** Return only the final answer.

        Response Format:

        If the context is insufficient: "Not enough information. Please provide more details."
        Else respond clearly, concisely, and fully in the same language as the question.

        Example Answer Templates:

        If the context is sufficient and the question is direct:
        "[answer]"

        If the context is insufficient:
        "Not enough information. Please provide more details."

        ## CONTEXT ##  
        ${context}  

        ## MESSAGE_HISTORY ##  
        ${messagesString}  

        ## QUESTION ## 
        ${question}  

        ## ADDITIONAL INFORMATION ##
        Use information from CONTEXT to maximize relevance and accuracy. If information in CONTEXT isn't sufficient, use MESSAGE_HISTORY. If no relevant information is found, follow Step 2.
    `;
    console.log(prompt);

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