const resolveTicket = (app, tokens) => 
    async ({ body, ack, payload}) => {
        console.log('payload', payload);
        ack();
        const {trigger_id, user_id} = body;
    
        if((tokens.filter(obj => obj[user_id])).length === 0){
            try{
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
    
                
            }catch(err){}
        }else{
            try{
                app.client.views.open({
                    token: process.env.SLACK_BOT_TOKEN,
                    trigger_id,
                    view: 
                        {
                        "callback_id": "resolve_ticket_id",
                        "type": "modal",
                        "title": {
                            "type": "plain_text",
                            "text": `Resolving Ticket ${payload.text}`,
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
                                "type": "context",
                                "elements": [
                                    {
                                        "type": "mrkdwn",
                                        "text": `ID: ${payload.text}`
                                    }
                                ]
                            },
                            {
                                "type": "section",
                                "text": {
                                    "type": "plain_text",
                                    "text": "What is the solution?",
                                    "emoji": true
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "block_id": "solution",
                                "type": "input",
                                "label": {
                                    "type": "plain_text",
                                    "text": "Solution",
                                    "emoji": true
                                },
                                "element": {
                                    "action_id": "solutionchild",
                                    "type": "plain_text_input",
                                    "multiline": true
                                }
                            },
                        ]
                    }
                    
                });
            }catch(err){}
        } 
      }



  module.exports = resolveTicket;