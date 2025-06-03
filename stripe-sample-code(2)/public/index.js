import { loadConnectAndInitialize } from "@stripe/connect-js";

const fetchClientSecret = async () => {
  const response = await fetch('/account_session', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      account: connectedAccountId,
    }),
  });
  if (!response.ok) {
    // Handle errors on the client side here
    const {error} = await response.json();
    document.getElementById("error").classList.remove("hidden");
    return undefined;
  } else {
    const {client_secret: clientSecret} = await response.json();
    return clientSecret;
  }
}

let connectedAccountId = null;

const signUpButton = document.getElementById("sign-up-button");
signUpButton.onclick = async () => {
  document.getElementById("dev-callout").classList.remove("hidden");
  document.getElementById("creating-connected-account").classList.remove("hidden");
  document.getElementById("error").classList.add("hidden");
  document.getElementById("sign-up-button").classList.add("hidden");

  fetch("/account", {
    method: "POST",
  })
    .then((response) => response.json())
    .then((json) => {
      const {account, error} = json;

      if (error) {
        document.getElementById("error").classList.remove("hidden");
        document.getElementById("sign-up-button").classList.remove("hidden");
        document.getElementById("creating-connected-account").classList.add("hidden");
        document.getElementById("dev-callout").classList.add("hidden");
        return;
      }

      connectedAccountId = account;

      const connectedAccountIdElement = document.getElementById("connected-account-id");
      connectedAccountIdElement.innerHTML = `Your connected account ID is: <code class="bold">${connectedAccountId}</code>`;
      connectedAccountIdElement.classList.remove("hidden");

      document.getElementById("creating-connected-account").classList.add("hidden");
      document.getElementById("title").classList.add("hidden");
      document.getElementById("subtitle").classList.add("hidden");

      const instance = loadConnectAndInitialize({
        publishableKey: "pk_test_51RVgPTQWkT8TMd2NZuk9vruxAqNdLLXLAFNvyJazrb6gAnNWugo2SpbgvDOMEwiL7m2gOsLuaZCIdLHk38K1jgaM00CJCeQDKN",
        fetchClientSecret: fetchClientSecret,
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: "#635BFF",
          },
        },
      });

      const container = document.getElementById("embedded-onboarding-container");
      const embeddedOnboardingComponent = instance.create("account-onboarding");
      embeddedOnboardingComponent.setOnExit(() => {
        console.log('User exited the onboarding flow');
      });
      container.appendChild(embeddedOnboardingComponent);
    });
};