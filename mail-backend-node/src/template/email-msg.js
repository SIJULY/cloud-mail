function escapeHtml(text = '') {
	return (text || '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}

export default function emailMsgTemplate(email, tgMsgTo, tgMsgFrom) {

	let template = `<b>${escapeHtml(email.subject)}</b>`

		if (tgMsgFrom === 'only-name') {
			template += `

发件人：${escapeHtml(email.name)}`
		}

		if (tgMsgFrom === 'show') {
			template += `

发件人：${escapeHtml(email.name)}  &lt;${escapeHtml(email.sendEmail)}&gt;`
		}

		if(tgMsgTo === 'show' && tgMsgFrom === 'hide') {
			template += `

收件人：\u200B${escapeHtml(email.toEmail)}`
			return template
		}

	if(tgMsgTo === 'show') {
		template += `
收件人：\u200B${escapeHtml(email.toEmail)}`
	}

		return template;

}
