var fs = require('fs');
var ejs = require('ejs');
var tumblr = require('tumblr.js');
var mandrill = require('mandrill-api/mandrill');

var csvFile = fs.readFileSync("friend_list.csv","utf8");
var emailTemplate = fs.readFileSync('email_template.html', 'utf8');

var client = tumblr.createClient({
  consumer_key: '3F8QjiQROH7dEbaQGaXm05qxe68ME2RpbRXY6dWDhj0ePTFnNh',
  consumer_secret: 'EF6lTdIFW91WuKyx7Q8FasBGk0AVZJIGQqY496L6653ltQNmho',
  token: 'YTpn0lViUY0Kchf6D7gF5GUuQ7gO38kPxgSlnncSdYX4UMBdKs',
  token_secret: '9W4eojgeJQmUH8l6cuimJrvfUsEK0e5sGWsIrRyxHqQ2bvhIzy'
});
var mandrill_client = new mandrill.Mandrill('ASh7yBLxpEsKqvs-FxEK5A');

function csvParse(csvFile) {
  var arrayOfObjects = [];
  var arr = csvFile.split('\n');
  var newObj;

  var keys = arr.shift().split(",");
  arr.pop();
  arr.forEach(function(contact){
    contact = contact.split(",");
    newObj = {};

    for (var i=0; i < contact.length; i++){
      newObj[keys[i]] = contact[i];
    }

    arrayOfObjects.push(newObj);

  })

  return arrayOfObjects;

}

friendList = csvParse(csvFile);

friendList.forEach(function(row){
  var firstName = row["firstName"];
  var numMonthsSinceContact = row["numMonthsSinceContact"];
  var emailAddress = row["emailAddress"];


  // var templateCopy = emailTemplate;
  // templateCopy = templateCopy.replace(/FIRST_NAME/gi, firstName).replace(/NUM_MONTHS_SINCE_CONTACT/gi, numMonthsSinceContact);
  client.posts('leeeuniz.tumblr.com', function(error, blog){
    var latestPosts = blog.posts.filter(function(post) {
      return Date.now()*0.001 - post.timestamp <= 604800;
    });

    var customizedTemplate = ejs.render(emailTemplate, {firstName: firstName,
                                                        numMonthsSinceContact: numMonthsSinceContact,
                                                        latestPosts: latestPosts
                                                        });

  sendEmail(firstName, emailAddress, "Eunice", "eueu.lee@gmail.com", "Hello! I have a blog!", customizedTemplate);
  // console.log(customizedTemplate);

  });
});

function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
  var message = {
    "html": message_html,
    "subject": subject,
    "from_email": from_email,
    "from_name": from_name,
    "to": [{
      "email": to_email,
      "name": to_name
    }],
    "important": false,
    "track_opens": true,
    "auto_html": false,
    "preserve_recipients": true,
    "merge": false,
    "tags": [
      "Fullstack_Tumblrmailer_Workshop"
    ]
  };
  var async = false;
  var ip_pool = "Main Pool";
  mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result){
    // console.log(message);
    // conosole.log(result);
  }, function(e){
    // Mandrill returns the error as an object with name and message keys
    console.log('A mandrill error occured: ' + e.name + '-' + e.message);
    // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
  });
}
