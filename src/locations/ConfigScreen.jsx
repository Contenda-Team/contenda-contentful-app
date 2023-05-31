import React, { useCallback, useState, useEffect } from 'react';
import { TextLink, TextInput, Form, FormControl, Flex } from '@contentful/f36-components';
import { css } from 'emotion';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';

const BASE_URL = "https://prod.contenda.io"

const ConfigScreen = () => {
  const [parameters, setParameters] = useState({
    apiKey: "",
    email: ""
  });
  const [isInvalid, setIsInvalid] = useState(false);  
  const sdk = useSDK();

  const isGetTokenOk = async (inputEmail, inputApiKey) => {
    // getting the Contenda token and if there's no error then true
    const getTokenUrl = `${BASE_URL}/api/v2/identity/token`
    const tokenResponse = await fetch(getTokenUrl, {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inputEmail,
        api_key: inputApiKey
      }),
    })
    return tokenResponse.ok
  }
  /*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  */
  // const cma = useCMA();
  const onConfigure = useCallback(async () => {
    // This method will be called when a user clicks on "Install"
    // or "Save" in the configuration screen.
    // for more details see https://www.contentful.com/developers/docs/extensibility/ui-extensions/sdk-reference/#register-an-app-configuration-hook

    // Get current the state of EditorInterface and other entities
    // related to this app installation
    const currentState = await sdk.app.getCurrentState();
    const isUserValid = await isGetTokenOk(parameters.email, parameters.apiKey)
    if (isUserValid) {
      setIsInvalid(false)
      return {
        // Parameters to be persisted as the app configuration.
        parameters,
        // In case you don't want to submit any update to app
        // locations, you can just pass the currentState as is
        targetState: currentState,
      };   
    } else {
      setIsInvalid(true)
      sdk.notifier.error("Invalid email or api key - fix before installing.");
      return false;
    }
  }, [parameters, sdk]);

  useEffect(() => {
    // `onConfigure` allows to configure a callback to be
    // invoked when a user attempts to install the app or update
    // its configuration.
    sdk.app.onConfigure(() => onConfigure());
  }, [sdk, onConfigure]);


  useEffect(() => {
    (async () => {
      // Get current parameters of the app.
      // If the app is not installed yet, `parameters` will be `null`.
      const currentParameters = await sdk.app.getParameters();
      if (currentParameters) {
        setParameters(currentParameters);
      }
      // Once preparation has finished, call `setReady` to hide
      // the loading screen and present the app to a user.
      sdk.app.setReady();
    })();
  }, [sdk]);

  return (
    <Flex flexDirection="column" className={css({ margin: '80px', maxWidth: '800px' })}>
      <Form>
        <FormControl isRequired isInvalid={isInvalid}>
        <FormControl.Label>Contenda Username (email)</FormControl.Label>
          <TextInput
            value={parameters.email}
            type='email'
            onChange={(e) => setParameters({ ...parameters, email: e.target.value })}
          />
        </FormControl>
        <FormControl isRequired isInvalid={isInvalid}>
          <FormControl.Label>API Key</FormControl.Label>
          <TextInput
            value={parameters.apiKey}
            type='password'
            onChange={(e) => setParameters({ ...parameters, apiKey: e.target.value })}
          />
          <FormControl.HelpText>
            Don't have one? Sign up at <TextLink href="https://signup.contenda.co/">here</TextLink>
          </FormControl.HelpText>
          {isInvalid && (
            <FormControl.ValidationMessage>Invalid email or api key. Contact support@contenda.co for help.</FormControl.ValidationMessage>
          )}          
        </FormControl>
      </Form>
    </Flex>
  );
};
export default ConfigScreen;
