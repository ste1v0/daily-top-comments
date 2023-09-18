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

    return data.items.map(e => ({
        threadLink: `https://vas3k.club/${e._club.type}/${e._club.slug}`,
        title: e.title
    }))
}

async function fetchComments(data) {
    let topCommentsData = []
    const date = new Date()
    let year = date.getFullYear()
    let month = String(date.getMonth() + 1).padStart(2, '0')
    let day = String(date.getDate()).padStart(2, '0');
    let formatted = `${year}-${month}-${day}`;

    for (let link of data) {
        const response = await axios.get(`${link.threadLink}/comments.json`, {
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

                if (comment.upvotes >= 4 && formatted === formatted1) {
                    topCommentsData.push( {
                        title: link.title,
                        id: comment.id,
                        link: link.threadLink,
                        commentLink: `${link.threadLink}/#comment-${comment.id}`,
                        text: comment.text,
                        author: comment.author.full_name,
                        slug: comment.author.slug,
                        position: comment.author.position,
                        company: comment.author.company,
                        upvotes: comment.upvotes
                    })
                }

        }

    }
    topCommentsData.sort((a, b) => b.upvotes - a.upvotes)

    let topComments = topCommentsData.map(e => {
        if (e.text.length > 150) {
            return `💭 Re: [${e.title}](${e.link})\n\n${e.upvotes} ⭐ ${e.text.substring(0, 150)} ... [продолжение](${e.commentLink})\n\n[${e.author}](https://vas3k.club/user/${e.slug}), ${e.position} @ ${e.company}\n\n`
        } else {
            return `💭 Re: [${e.title}](${e.link})\n\n${e.upvotes} ⭐ ${e.text}\n\n[${e.author}](https://vas3k.club/user/${e.slug}), ${e.position} @ ${e.company}\n\n`
        }
    })

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
            parse_mode: 'Markdown',
            disable_web_page_preview: true
        });
    }
}

async function main() {
    let data = await fetchLinks();
    await fetchComments(data);
}

main()

// setInterval(main, 86400000) // Run once per day
