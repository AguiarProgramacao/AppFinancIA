export async function sendExpoPushNotification(params: {
  token: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}) {
  if (!params.token) {
    return;
  }

  if (!params.token.startsWith("ExponentPushToken")) {
    console.warn("Expo push token invalido");
    return;
  }

  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: params.token,
        title: params.title,
        body: params.body,
        sound: "default",
        data: params.data,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erro ao enviar push:", text);
    }
  } catch (err) {
    console.error("Erro ao enviar push:", err);
  }
}
