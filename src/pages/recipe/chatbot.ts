import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: "org-DvxD7WXXua07rr3kHJ35TgU1",
    apiKey: "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",
});
const openAI = new OpenAIApi(configuration);

const chat: Array<ChatCompletionRequestMessage> = [{ role: "system", content: "You are a helpful cooking instructor." }]

export const ask = async (message: string) => {

    chat.push({ role: "user", content: message })
    const res = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: chat,
    });
    const ans = res.data.choices[0]?.message?.content;
    if (ans) {
        chat.push({ role: "assistant", content: ans })
    }
    return ans;
};