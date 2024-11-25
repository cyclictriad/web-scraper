import User from "../models/User"

export default defineEventHandler(async (event) => {
    const query = new Set(Object.keys(await getQuery(event)))

    if (query.has('logout')) {
        return setCookie(event, '_id', '', {
            maxAge: -1, // Set maxAge to -1 to expire the cookie
            path: '/',  // Specify the path, ensure it's the same as when it was created
        });

    }

    const body = await readBody(event)

    let user;
    if (query.has('signup')) {
        user = await User.create(body)

    } else if (query.has('signin')) {
        user = await User.findOne({ 'stuvia.email': body.email })
    }
    else return;
    if (!user) return;


    setCookie(event, 'user_name', user.name, {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });
    setCookie(event, '_id', user._id.toString(), {
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });
    if (!user.preferences.upload.dir) {
        setCookie(event, 'setup-required', true, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });
        setCookie(event, 'setup-flashcards', true, {
            maxAge: 60 * 60 * 24 * 30,
            path: '/',
        });

    }

    return;

})