import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: "org-DvxD7WXXua07rr3kHJ35TgU1",
    apiKey: "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",
});
const openAI = new OpenAIApi(configuration);

type UserMessage = string
type BotMessage = string
type Message = UserMessage | BotMessage
export class ChatBot {
    private chat: Message[] = []
    constructor() { }

    async ask(message: UserMessage) {
        this.chat.push(message)
        const res = await openAI
            .createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    { content: "what is the answer to all things?", role: "user" },
                ],
            })
        const ans = res.data.choices[0]?.message?.content
        if (ans) {
            this.chat.push(ans)
        }
        return ans
    }

    getChat() {
        return this.chat;
    }
}