const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

async function listAllUsers(nextPageToken = undefined) {
    const options = nextPageToken ? { maxResults: 1000, pageToken: nextPageToken } : { maxResults: 1000 };

    admin.auth().listUsers(options.maxResults, options.pageToken)
        .then((listUsersResult) => {
            let users = listUsersResult.users.map(user => {
                return {
                    email: user.email || '',
                    displayName: user.displayName || ''
                    // Add other user fields as needed
                };
            });
            fs.appendFileSync('users.csv', users.map(user => `"${user.email}","${user.displayName}"\n`).join(''), { flags: 'a' });
            if (listUsersResult.pageToken) {
                listAllUsers(listUsersResult.pageToken);
            }
        })
        .catch((error) => {
            console.log('Error listing users:', error);
        });
}

fs.writeFileSync('users.csv', '"Email","DisplayName"\n');

listAllUsers();