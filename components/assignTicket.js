const axiosWithAuth = require('../components/axiosWithAuth');

const assignTicket = (app, tokens) => 
    async ({ body, payload, ack, say }) => {
        ack();
        const ticket_id = body.message.blocks[0].elements[0].text.match(/[0-9]+/)[0];
        const {trigger_id} = body;
        const user_id = body.user.id;
        console.log(tokens);

        try{
            if((tokens.filter(obj => obj[user_id])).length === 0){
                app.client.views.open({
                    token: process.env.SLACK_BOT_TOKEN,
                    trigger_id,
                    view: {
                        "callback_id": "helper_login_id",
                        "type": "modal",
                        "title": {
                            "type": "plain_text",
                            "text": "Login",
                            "emoji": true
                        },
                        "submit": {
                            "type": "plain_text",
                            "text": "Submit",
                            "emoji": true,
                        },
                        "close": {
                            "type": "plain_text",
                            "text": "Cancel",
                            "emoji": true
                        },
                        "blocks": [
                            {
                                "block_id": "username",
                                "type": "input",
                                "label": {
                                    "type": "plain_text",
                                    "text": "Username",
                                    "emoji": true
                                },
                                "element": {
                                    "action_id": "usernamechild",
                                    "type": "plain_text_input",
                                    "multiline": false
                                },
                                "optional": false
                            },
                            {
                                "block_id": "password",
                                "type": "input",
                                "label": {
                                    "type": "plain_text",
                                    "text": "Password",
                                    "emoji": true
                                },
                                "element": {
                                    "action_id": "passwordchild",
                                    "type": "plain_text_input",
                                    "multiline": false,
                                }
                            },
                        ]
                    } 
                });
            }else{
                const hmm = await axiosWithAuth(user_id, tokens).post(`/tickets/${ticket_id}/help`, {slack: true, user_id});
                console.log(hmm);
            }
        }catch(err){}
    };


module.exports = assignTicket;