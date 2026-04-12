// Custom _error.tsx to replace Next.js's built-in error page.
// This prevents the "duplicate React" SSR prerendering failure on Windows
// caused by case-insensitive path resolution in the webpack worker.

function Error({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>{statusCode ? `Ошибка ${statusCode}` : 'Произошла ошибка'}</h1>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: { res?: { statusCode: number }; err?: { statusCode: number } }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
