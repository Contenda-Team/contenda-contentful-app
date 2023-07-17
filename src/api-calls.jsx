const BASE_URL = "https://prod.contenda.co"
// const BASE_URL = "https://noodle.contenda.co"

/**
 * With the latest v3 auth update, distinguish if the api key is for v3.
 * otherwise, it's an api key for an older auth version or is invalid
 * @param {string} apiKey 
 * @returns true if given apiKey is an aceptable key for auth v3
 */
const isAcceptableV3ApiKey = (apiKey) => {
    console.log("isAcceptableV3ApiKey call");
    return apiKey.length === 43
}

/**
 * @param {string} token 
 * @returns api headers for v3 endpoints
 */
const getApiHeaders = (token) => {
    return {
        "Content-Type": "application/json",
        // "User-Agent": "Contentful",
        "Authorization": "Bearer " + token
    }
}

const getToken = async (email, apiKey) => {
    let response
    if (isAcceptableV3ApiKey(apiKey)) {
        console.log("v3 getToken call");
        const getTokenUrl = `${BASE_URL}/auth/v1/flow/apilogin`
        response = await fetch(
            getTokenUrl,
            {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_email: email,
                    api_key: apiKey
                }),
            }
        )
    } else {
        console.log("v2 getToken call");
        const getTokenUrl = `${BASE_URL}/api/v2/identity/token`
        response = await fetch(getTokenUrl, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                api_key: apiKey
            }),
        })
    }


    if (response.ok) {
        const tokenData = await response.json();
        console.log(tokenData)
        const token = tokenData.access_token
        return token
    } else if (response.status === 401) {
        return false  //  notification that token is invalid?
    } else {
        return false  // raise error?
    }
};


const getBlogList = async (token, apiKey) => {
    let response
    if (isAcceptableV3ApiKey(apiKey)) {
        console.log("v3 getBlogList call");
        response = await fetch(
            `${BASE_URL}/api/v3/content/blog/list`,
            {
                method: "GET",
                credentials: "include",
                headers: getApiHeaders(token),
            }
        );
    } else {
        console.log("v2 getBlogList call");
        response = await fetch(`${BASE_URL}/api/v2/content/blog/list?token=${token}`)
    }
    const allBlogs = await response.json();
    console.log("allBlogs:", allBlogs);
    return allBlogs
};


const getBlog = async (blogId, token, apiKey) => {
    let response
    if (isAcceptableV3ApiKey(apiKey)) {
        console.log("v3 getBlog call");
        response = await fetch(
            `${BASE_URL}/api/v3/content/blog/${blogId}`,
            {
                method: "GET",
                credentials: "include",
                headers: getApiHeaders(token),
            }
        );
    } else {
        console.log("v2 getBlog call");
        response = await fetch(`${BASE_URL}/api/v2/content/blog/${blogId}?token=${token}`)
    }
    let blog = await response.json();
    return blog;
};

export { getToken, getBlogList, getBlog, isAcceptableV3ApiKey };