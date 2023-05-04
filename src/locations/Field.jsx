import React, { useState, useEffect } from 'react';
import { RichTextEditor } from '@contentful/field-editor-rich-text';
import { Form, FormControl, Button, Note } from '@contentful/f36-components';
import { useCMA, useSDK, useAutoResizer } from '@contentful/react-apps-toolkit';
import { ValidationError } from '@contentful/app-sdk';


const Field = () => {
  const sdk = useSDK();
  const [adviceErrorMessages, setAdviceErrorMessages] = useState([])

  useAutoResizer()

  const handleButtonClick = async () => {
    const resultDocument = {
      "nodeType": "document",
      "data": {},
      "content": [
        {
          "nodeType": "paragraph",
          "data": {},
          "content": [
            {
              "nodeType": "text",
              "value": "hi i promise i'm using the embedded-asset-block!",
              "marks": [],
              "data": {}
            }
          ]
        },
        {
          "nodeType": "embedded-asset-block",
          "content": [],
          "data": {
            "target": {
              "sys": {
                "id": "61iT3zdYzUW73hoIoAQcsp",
                "type": "Link",
                "linkType": "Asset"
              }
            }
          }
        }
      ]
    }
    sdk.field.setValue(resultDocument)
    console.log(sdk.field);
  }

  useEffect(() => {
    sdk.field.onSchemaErrorsChanged((errors) => {
      let messagesToRender = []
      for (const error of errors) {
        if (error.name === "enabledNodeTypes" && !error.message.includes("block asset")) {
          messagesToRender.push(<Note variant="neutral">Check the field's settings to enable "Embedded Assets"</Note>)
        } else if (error.name === "size") {
          messagesToRender.push(<Note variant="neutral">Check the field's settings to increase the limit number of Embedded Assets</Note>)
        }
      }
      setAdviceErrorMessages(messagesToRender)
    })
  }, [sdk.field.validation])


  return (
    <>
      <Form onSubmit={handleButtonClick}>
        <FormControl>
          <Button type='submit' variant='primary'>Choose a Contenda Blog</Button>
        </FormControl>
      </Form>
      <RichTextEditor sdk={sdk} isInitiallyDisabled={true} />
      {adviceErrorMessages}
    </>
  )
};

export default Field;
