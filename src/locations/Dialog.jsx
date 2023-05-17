import React, { useState, useEffect } from 'react';
import { Spinner, Stack, EntityList, Flex, Text } from '@contentful/f36-components';
import { useCMA, useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';

const BASE_URL = "https://prod.contenda.io"

const Dialog = () => {
  const sdk = useSDK();
  const cma = useCMA();
  useAutoResizer();
  const [token, setToken] = useState()
  const [contendaBlogs, setContendaBlogs] = useState([])
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  const { email, apiKey } = sdk.parameters.installation;

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

  const fetchBlog = async (blogId) => {
    console.log("token: ", token);
    const getBlogUrl = `${BASE_URL}/api/v2/content/blog/${blogId}`

    const blogResponse = await fetch(`${getBlogUrl}?token=${token}`)
    const blog = await blogResponse.json();
    console.log(blogId, "blog: ", blog);

    blog.id = blogId

    setIsUploadingImages(true)
    let addImagePromises = []
    for (let segment of blog.segments) {
      if (segment.segment_type === "image" || segment.segment_type === "user_image") {
        addImagePromises.push(addImageAsset("contenda image", segment).then((asset) => console.log("fetchBlog", asset)))
      }
    }
    Promise.all(addImagePromises).then(() => {
      setIsUploadingImages(false)
      sdk.close(blog)
    })
  }

  const addImageAsset = async (assetTitle, imageSegment) => {
    console.log("image id: ", imageSegment.id);
    const asset = await cma.asset.createWithId(
      { assetId: imageSegment.id }, {
      fields: {
        title: {
          'en-US': assetTitle
        },
        file: {
          'en-US': {
            contentType: 'image/jpeg',
            fileName: imageSegment.id + '.jpeg',
            upload: imageSegment.image_url,
          }
        }
      }
    })
      .then((asset) => cma.asset.processForAllLocales({}, asset))
      // .then((asset) => cma.asset.publish({ assetId: asset.sys.id }, asset))
      .catch((err) => console.log(err))

    return asset
  }

  useEffect(() => {
    fetchAllBlogsData()
  }, [sdk.parameters.invocation])

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
    <Stack fullWidth>
      <EntityList style={{
        width: '100%'
      }}>
        {
          contendaBlogs.map((blog) => {
            return (<EntityList.Item
              key={blog.id}
              title={blog.title}
              entityType={"Page"}
              description={`Created: ${blog.created_at?.substring(0,10)}`}
              onClick={() => fetchBlog(blog.id)}
            />)
          })
        }
      </EntityList>
    </Stack>
  );
};

export default Dialog;
