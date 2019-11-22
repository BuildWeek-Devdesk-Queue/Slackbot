const openTicket = (app, tokens) => 
    async ({ body, ack, payload, say, message}) => {
        console.log(payload);
        ack();
        const {trigger_id, user_id} = body;
    
        if((tokens.filter(obj => obj[user_id])).length === 0){
            try{
                app.client.views.open({
                    token: process.env.SLACK_BOT_TOKEN,
                    trigger_id,
                    view: {
                        "callback_id": "student_login_id",
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
                    view: {
                        "callback_id": "open_ticket_id",
                        "type": "modal",
                        "title": {
                            "type": "plain_text",
                            "text": "Open a ticket",
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
                                "type": "section",
                                "text": {
                                    "type": "plain_text",
                                    "text": "Hey!\n\nWhat problem are you having?",
                                    "emoji": true
                                }
                            },
                            {
                                "type": "divider"
                            },
                            {
                                "block_id": "category",
                                "type": "input",
                                "label": {
                                    "type": "plain_text",
                                    "text": "Category",
                                },
                                "element": {
                                    "action_id": "categorychild",
                                    "type": "static_select",
                                    "placeholder": {
                                        "type": "plain_text",
                                        "text": "Select an item",
                                    },
                                    "options": [
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "HTML",
                                            },
                                            "value": "value-0"
                                        },
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "CSS/LESS/SASS",
                                            },
                                            "value": "value-1"
                                        },
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "JavaScript",
                                            },
                                            "value": "value-2"
                                        },
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "React",
                                            },
                                            "value": "value-3"
                                        },
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Redux",
                                            },
                                            "value": "value-4"
                                        },
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Node",
                                            },
                                            "value": "value-5"
                                        },
                                        {
                                            "text": {
                                                "type": "plain_text",
                                                "text": "Python",
                                            },
                                            "value": "value-6"
                                        }
                                    ]
                                }
                            },
                            {
                                "block_id": "title",
                                "type": "input",
                                "label": {
                                    "type": "plain_text",
                                    "text": "Title",
                                    "emoji": true
                                },
                                "element": {
                                    "action_id": "titlechild",
                                    "type": "plain_text_input",
                                    "multiline": false
                                },
                                "optional": false
                            },
                            {
                                "block_id": "description",
                                "type": "input",
                                "label": {
                                    "type": "plain_text",
                                    "text": "Description",
                                    "emoji": true
                                },
                                "element": {
                                    "action_id": "descriptionchild",
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



  module.exports = openTicket;