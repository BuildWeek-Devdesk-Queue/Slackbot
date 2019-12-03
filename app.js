const { App } = require('@slack/bolt');
const axios = require('axios');
const axiosWithAuth = require('./components/axiosWithAuth');
const openTicket = require('./components/open-ticket');
const resolveTicket = require('./components/resolve-ticket');
const assignTicket = require('./components/assignTicket');

const tokens = [];

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

app.message('hello', ({ message, say }) => {
    say(`Hey there <@${message.user}>!`);
  });

app.message('how are you', ({ message, say }) => {
    console.log(message);
    say(`Hey there <@${message.user}>! I am doing great. Thanks for asking!`);
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
    const result = await axiosWithAuth(user_id, tokens).post('/tickets', {category, title, description});
});

app.view('resolve_ticket_id', async ({ack, body, payload, view, context}) => {
    ack();
    const user_id = body.user.id;
    const id = payload.title.text.match(/[0-9]+/)[0];
    let {solution} = payload.state.values;
    console.log(solution);
    solution = solution.solutionchild.value;
    await axiosWithAuth(user_id, tokens).post(`/tickets/${id}/resolve`, {solution});
});

app.view('student_login_id', async ({ack, body, payload, view, context}) => {
    ack();
    const {trigger_id} = body;
    const user_id = body.user.id;
    console.log('testing123');
    
    let {username, password} = payload.state.values;
    username = username.usernamechild.value;
    password = password.passwordchild.value;

    try{
        const result = await axios.post('https://ddq.herokuapp.com/api/auth/login', {username, password});
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
        const result = await axios.post('https://ddq.herokuapp.com/api/auth/login', {username, password});
        const {token} = result && result.data;
        const tokenStore = {};
        tokenStore[user_id] = token;
        tokens.push({...tokenStore});
    }catch(err){}
});


app.command('/ticket', openTicket(app, tokens));
app.command('/resolve', resolveTicket(app, tokens));

app.command()

app.action('assign_ticket', assignTicket(app, tokens)); 

(async () => {
  const port = process.env.PORT || 4000
  await app.start(port);

  console.log(`⚡️ Bolt app is running on port ${port}`);
})();

module.exports = app;