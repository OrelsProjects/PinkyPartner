function randomNotification() {
    const notifTitle = "Title"
    const notifBody = `Body`;
    const notifImg = `/vercel.png`;
    const options = {
      body: notifBody,
      icon: notifImg,
    };
    new Notification(notifTitle, options);
    setTimeout(randomNotification, 3000);
}