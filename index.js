import axios from "axios"

const SERVICE_TOKEN = ''

const URL = 'https://vas3k.club/feed.json'
const TELEGRAM_TOKEN = ''
const CHAT_ID = ''

async function fetchLinks() {
    const response = await axios.get(URL, {
        headers: {
            'X-Service-Token': SERVICE_TOKEN
        }
    })
    const data = response.data
    return data.items.map(e => `https://vas3k.club/${e._club.type}/${e._club.slug}`)
}

async function fetchComments(data) {
    console.log(data)
    let topComments = []
    const date = new Date()
    let year = date.getFullYear()
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let day = String(date.getDate()).padStart(2, '0');
    let formatted = `${year}-${month}-${day}`;

    for (let link of data) {
        const response = await axios.get(`${link}/comments.json`, {
            headers: {
                'X-Service-Token': SERVICE_TOKEN
            }
        })

        const commentsList = response.data.comments

        for (let comment of commentsList) {
            const commentDate = new Date(comment.created_at)
            let year1 = commentDate.getFullYear();
            let month1 = String(commentDate.getMonth() + 1).padStart(2, '0')
            let day1 = String(commentDate.getDate()).padStart(2, '0');
            let formatted1 = `${year1}-${month1}-${day1}`;

                if (comment.upvotes >= 2 && formatted === formatted1) {
                    topComments.push(`💭 ${comment.upvotes} ⭐ ${comment.text}\n\n✍️ [${comment.author.full_name}](https://vas3k.club/user/${comment.author.slug}), ${comment.author.position}\n🔗 [Тред](${link})`)
                    console.log(`Added ${comment.text}, sent on ${formatted1} `)
                }
        }

    }

    if (topComments.length > 0) {
        await sendToTelegram(topComments);
    } else {
        console.log("No comments found for the given conditions.");
    }

    async function sendToTelegram(topComments) {
        const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
        const message = topComments.join('\n\n')
        const response = await axios.post(telegramApiUrl, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        });
    }
}

async function main() {
    let data = await fetchLinks();
    await fetchComments(data);
}

main()

// setInterval(main, 86400000) // Run once per day
