import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
    organization: "org-DvxD7WXXua07rr3kHJ35TgU1",
    apiKey: "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",
});
const openAI = new OpenAIApi(configuration);

export const sendRecord = async (audioURL: string) => {
    try {
        // Prepare the form data
        let data = new FormData();
        const response = await fetch(audioURL);
        const blob = await response.blob();

        data.append('file', blob, 'file.webm');
        data.append('model', 'whisper-1');

        // Make the request
        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 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',
            },
            body: data
        });

        const result = await res.json();
        console.log(result);

        return result.text as string;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
