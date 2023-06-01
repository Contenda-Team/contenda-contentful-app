import React, { useState, useEffect } from 'react';
import { Spinner, Stack, EntityList, Flex, Text, Switch } from '@contentful/f36-components';
import { useCMA, useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';

const BASE_URL = "https://prod.contenda.io"

const Dialog = () => {
  const sdk = useSDK();
  const cma = useCMA();

  useAutoResizer();
  const [token, setToken] = useState()
  const [contendaBlogs, setContendaBlogs] = useState([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [allowAutoImportBlogImages, setAllowAutoImportBlogImages] = useState()

  const { email, apiKey } = sdk.parameters.installation;


  const saveAllowAutoImportBlogImages = async (value) => {
    cma.editorInterface.get({ contentTypeId: sdk.ids.contentType }).then(
      (editor) => {
        let fieldControl = editor.controls.find(control => control.fieldId == sdk.ids.field)
        fieldControl.settings.allowAutoImportBlogImages = value
        setAllowAutoImportBlogImages(value)
        return cma.editorInterface.update({ contentTypeId: sdk.ids.contentType }, editor)
      }
    )
  }

  const fetchAllBlogsData = async () => {
    const getTokenUrl = `${BASE_URL}/api/v2/identity/token`
    const getAllBlogsUrl = `${BASE_URL}/api/v2/content/blog/list`

    // get token
    const tokenResponse = await fetch(getTokenUrl, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        api_key: apiKey
      }),
    })
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token
    setToken(token)

    // get blogs list
    const allBlogsResponse = await fetch(`${getAllBlogsUrl}?token=${token}`)
    const allBlogs = await allBlogsResponse.json();
    console.log("allBlogs: ", allBlogs);

    setContendaBlogs(allBlogs);
  }

  const handleBlogSelection = async (blogId) => {
    console.log("token: ", token);
    const getBlogUrl = `${BASE_URL}/api/v2/content/blog/${blogId}`

    const blogResponse = await fetch(`${getBlogUrl}?token=${token}`)
    let blog = await blogResponse.json();
    console.log(blogId, "blog: ", blog);

    blog.id = blogId

    console.log("allowAutoImportBlogImages: ", allowAutoImportBlogImages);

    if (allowAutoImportBlogImages) {
      // const contentTypeId = sdk.ids.contentType
      // let contentTypeData = await cma.contentType.get({ "contentTypeId": sdk.ids.contentType })
      // let fieldData = contentTypeData.fields.find(field => field.id == sdk.ids.field)
      // let enabledTypesValidationRule = fieldData.validations.find(validation => "enabledNodeTypes" in validation)
  
      // if (enabledTypesValidationRule && !enabledTypesValidationRule.enabledNodeTypes.includes("embedded-asset-block")) {
      //   await sdk.dialogs.openConfirm({
      //     title: "Your field settings don't allow for embedded blog images",
      //     message: `Would you like to change your settings to allow \"Embedded Assets\" in this field across this content type ${contentTypeId}?`,
      //     intent: 'positive',
      //     confirmLabel: 'Yes, change my settings',
      //     cancelLabel: 'No, go back to selection',
      //   })
      //   .then((allowChangeSettings) => {
      //     if (allowChangeSettings) {
      //       enableEmbeddedAssets()
      //     }
      //     return allowChangeSettings
      //   })
      // }

      setIsUploadingImages(true)
      let addImagePromises = []
      let image_idx = 1
      for (let segment of blog.segments) {
        if (segment.segment_type === "image" || segment.segment_type === "user_image") {
          addImagePromises.push(addImageAsset("Contenda Blog Image " + image_idx, segment)
            .then((asset) => console.log("image asset", asset)))
          image_idx++
        }
      }
      Promise.all(addImagePromises)
        .then(() => {
          setIsUploadingImages(false)
          console.log("images finished uploading and processing in promise.all");
          sdk.close(blog)
        })
        .catch((err) => console.error(err))
    } else {
      setIsUploadingImages(false)
      const segmentsNoImages = blog.segments.filter(
        segment => segment.segment_type !== "image" && segment.segment_type !== "user_image"
      )
      blog.segments = segmentsNoImages
      sdk.close(blog)
    }
  }

  const addImageAsset = async (assetTitle, imageSegment) => {
    console.log("image id: ", imageSegment.id);
    let assetFields = {}
    const locale = await sdk.locales.default
    assetFields.title = {}
    assetFields.title[locale] = assetTitle
    assetFields.file = {}
    assetFields.file[locale] = {
      contentType: 'image/jpeg',
      fileName: imageSegment.id + '.jpeg',
      upload: imageSegment.image_url,
    }
    const asset = await cma.asset.createWithId(
      { assetId: imageSegment.id }, {
      fields: assetFields
    })
      .then((asset) => cma.asset.processForAllLocales({}, asset))
      // .then((asset) => cma.asset.publish({ assetId: asset.sys.id }, asset))
      .catch((err) => console.error(err))

    return asset
  }

  const enableEmbeddedAssets = async () => {
    const contentTypeId = sdk.ids.contentType
    let contentTypeData = await cma.contentType.get({ "contentTypeId": contentTypeId })
    let fieldData = contentTypeData.fields.find(field => field.id == sdk.ids.field)
    let enabledTypesValidationRule = fieldData.validations.find(validation => "enabledNodeTypes" in validation)

    enabledTypesValidationRule.enabledNodeTypes.push("embedded-asset-block")
    enabledTypesValidationRule.message = "Only heading 1, heading 2, heading 3, heading 4, heading 5, heading 6, ordered list, unordered list, horizontal rule, quote, block entry, table, link to Url, link to entry, inline entry, and asset nodes are allowed"
    cma.contentType.update({ contentTypeId: contentTypeId }, contentTypeData)
      .then(updatedContentType => cma.contentType.publish({ contentTypeId: contentTypeId }, updatedContentType))
      .catch(err => console.error(err))
  }

  useEffect(() => {
    fetchAllBlogsData()
  }, [sdk.parameters.invocation])

  useEffect(() => {
    cma.editorInterface.get({ contentTypeId: sdk.ids.contentType }).then(
      (editor) => {
        const allow = editor.controls.find(control => control.fieldId == sdk.ids.field).settings?.allowAutoImportBlogImages
        setAllowAutoImportBlogImages(allow)
      })
  }, [sdk.editor])

  useEffect(() => {console.log("useEffect sdk.contentType", sdk.contentType);}, [sdk.contentType])  

  if (!contendaBlogs) {
    return (
      <Flex justifyContent="center">
        <Text marginRight="spacingXs">Fetching blog</Text>
        <Spinner />
      </Flex>
    )
  } else if (isUploadingImages) {
    return (
      <Flex justifyContent="center">
        <Text marginRight="spacingXs">Uploading blog image assets</Text>
        <Spinner />
      </Flex>
    )
  }

  return (
    <Stack fullWidth flexDirection="column" spacing="none">
      <Flex margin="spacingS" alignSelf="flex-start">
        <Switch
          name="allow-image-autoimport"
          id="allow-image-autoimport"
          isChecked={allowAutoImportBlogImages}
          onChange={() => saveAllowAutoImportBlogImages(!allowAutoImportBlogImages)}
          helpText="If on, will upload and process all the blog images as assets"
        >
          Embed Blog Images
        </Switch>
      </Flex>
      <EntityList style={{
        width: '100%'
      }}>
        {
          contendaBlogs.map((blog) => {
            return (<EntityList.Item
              key={blog.id}
              title={blog.title}
              entityType={"Page"}
              description={`Created: ${blog.created_at?.substring(0, 10)}`}
              onClick={() => handleBlogSelection(blog.id)}
            />)
          })
        }
      </EntityList>
    </Stack>
  );
};

export default Dialog;
