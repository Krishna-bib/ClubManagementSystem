export function getMysqlSsl() {
  if (process.env.DB_SSL !== 'true') {
    return undefined;
  }

  const ca = process.env.DB_SSL_CA?.replace(/\\n/g, '\n');
  if (process.env.NODE_ENV === 'production' && !ca) {
    throw new Error('Production MySQL TLS requires the provider CA certificate in DB_SSL_CA.');
  }

  return {
    rejectUnauthorized: true,
    ...(ca ? { ca } : {})
  };
}
