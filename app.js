require('dotenv').config()
const { App } = require('@slack/bolt');
const axios = require('axios');

const tokens = [];

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

function axiosWithAuth(user_id){
    const token = tokens.filter(obj => obj[user_id])[0];

    return axios.create({
        baseURL: 'http://localhost:5000/api/',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `${token[user_id]}`,
        },
    });
};

app.message('hello', ({ message, say }) => {
    // say() sends a message to the channel where the event was triggered
    say(`Hey there <@${message.user}>!`);
  });

app.view('open_ticket_id', async ({ack, body, payload, view, context}) => {
    ack();
    const user_id = body.user.id;
    
    let {category, title, description} = payload.state.values;
    category = category.categorychild.selected_option.text.text;
    title = title.titlechild.value;
    description = description.descriptionchild.value;
    console.log(`${category} ${description} ${title}`);
    console.log(user_id);
    const result = await axiosWithAuth(user_id).post('/tickets', {category, title, description});
});

app.view('student_login_id', async ({ack, body, payload, view, context}) => {
    ack();
    const {trigger_id} = body;
    const user_id = body.user.id;
    
    let {username, password} = payload.state.values;
    username = username.usernamechild.value;
    password = password.passwordchild.value;

    try{
        const result = await axios.post('http://localhost:5000/api/auth/login', {username, password});
        const {token} = result && result.data;
        const tokenStore = {};
        tokenStore[user_id] = token;
        tokens.push({...tokenStore});

        try{
            app.client.views.open({
                token: process.env.SLACK_BOT_TOKEN,
                trigger_id,
                view: {
                    "callback_id": "open_ticket_id",
                    "type": "modal",
                    "title": {
                        "type": "plain_text",
                        "text": "Open a ticket :hotdog:",
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
    }catch(err){}
});

app.view('helper_login_id', async ({ack, body, payload, view, context}) => {
    ack();
    const {trigger_id} = body;
    const user_id = body.user.id;
    let {username, password} = payload.state.values;
    username = username.usernamechild.value;
    password = password.passwordchild.value;

    try{
        const result = await axios.post('http://localhost:5000/api/auth/login', {username, password});
        const {token} = result && result.data;
        const tokenStore = {};
        tokenStore[user_id] = token;
        tokens.push({...tokenStore});

        
    }catch(err){}

});

app.command('/ticket', async ({ body, ack, payload, say}) => {
    
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
                        "text": "Open a ticket :hotdog:",
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
  });

  app.action('assign_ticket', async ({ body, payload, ack, say }) => {
    ack();
    const ticket_id = body.message.blocks[0].elements[0].text.match(/[0-9]+/)[0];
    const {trigger_id} = body;
    const user_id = body.user.id;

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
            await axiosWithAuth(user_id).post(`/tickets/${ticket_id}/help`, {slack: true, user_id});
        }
    }catch(err){}
  });

(async () => {
  const port = process.env.PORT || 4000
  await app.start(port);

  console.log(`⚡️ Bolt app is running on port ${port}`);
})();