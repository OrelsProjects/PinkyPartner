import { getRequestConfig } from "next-intl/server";

const locales = ["en", "he"];

export default getRequestConfig(async ({ locale }) => {
  const validatedLocale = locales.includes(locale) ? locale : "en";
  const messages = (await import(`../content/${locale}.json`)).default;
  return {
    messages,
    locale: validatedLocale,
  };
});
