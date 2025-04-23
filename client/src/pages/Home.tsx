import Page from '@components/Page';
import Header from '@components/Header';
import Footer from '@components/Footer';
import ContentContainer from '@components/ContentContainer';

export default function Home() {
  return (
    <Page>
      <Header />
      <ContentContainer>
        {/* Добавить содержимое */}
      </ContentContainer>
      <Footer />
    </Page>
  );
}