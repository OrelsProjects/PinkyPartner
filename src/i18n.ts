import { getRequestConfig } from "next-intl/server";

// Can be imported from a shared config
const locales = ["en", "de"];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validatedLocale = locales.includes(locale) ? locale : "en";

  return {
    messages: (await import(`../content/${validatedLocale}.json`)).default,
  };
});
