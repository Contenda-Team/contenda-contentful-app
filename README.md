# Contenda App
You can export your Contenda generated blogs straight into Contentful!

## How to use the Contenda app on the Contentful UI
1. Install the app and configure your app with your contenda account api key and email <img width="550" alt="image" src="https://user-images.githubusercontent.com/85570495/236056897-20d17fd3-3463-4f8f-b257-977a8ed7956b.png">
  
2. Go to whatever you use for your blog post content model and find the settings for the rich text field where your blog content would be
3. Change the appearance settings to be the "Contenda App" <img width="600" alt="image" src="https://user-images.githubusercontent.com/85570495/236057323-10d418bf-ec86-4a1e-a80f-b65883eb7a60.png">
  
4. Now, in your blog content field, you should see a button "Choose a Contenda Blog" <img width="700" alt="image" src="https://user-images.githubusercontent.com/85570495/236057541-02c428b8-4db6-4b50-9bbf-aace88a85bbb.png">

5. Select the desired blog, and the field will be populated with the blog content from Contenda

---

This project was bootstrapped with [Create Contentful App](https://github.com/contentful/create-contentful-app).


## Available Scripts

In the project directory, you can run:

#### `npm start`

Creates or updates your app definition in Contentful, and runs the app in development mode.
Open your app to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

#### `npm run build`

Builds the app for production to the `build` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

#### `npm run upload`

Uploads the build folder to contentful and creates a bundle that is automatically activated.
The command guides you through the deployment process and asks for all required arguments.
Read [here](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/#deploy-with-contentful) for more information about the deployment process.

#### `npm run upload-ci`

Similar to `npm run upload` it will upload your app to contentful and activate it. The only difference is  
that with this command all required arguments are read from the environment variables, for example when you add
the upload command to your CI pipeline.

For this command to work, the following environment variables must be set:

- `CONTENTFUL_ORG_ID` - The ID of your organization
- `CONTENTFUL_APP_DEF_ID` - The ID of the app to which to add the bundle
- `CONTENTFUL_ACCESS_TOKEN` - A personal [access token](https://www.contentful.com/developers/docs/references/content-management-api/#/reference/personal-access-tokens)

## Libraries to use

To make your app look and feel like Contentful use the following libraries:

- [Forma 36](https://f36.contentful.com/) – Contentful's design system
- [Contentful Field Editors](https://www.contentful.com/developers/docs/extensibility/field-editors/) – Contentful's field editor React components

## Using the `contentful-management` SDK

In the default create contentful app output, a contentful management client is
passed into each location. This can be used to interact with Contentful's
management API. For example

```js
// Use the client
cma.locale.getMany({}).then((locales) => console.log(locales));
```

Visit the [`contentful-management` documentation](https://www.contentful.com/developers/docs/extensibility/app-framework/sdk/#using-the-contentful-management-library)
to find out more.

## Learn More

[Read more](https://www.contentful.com/developers/docs/extensibility/app-framework/create-contentful-app/) and check out the video on how to use the CLI.

Create Contentful App uses [Create React App](https://create-react-app.dev/). You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started) and how to further customize your app.
