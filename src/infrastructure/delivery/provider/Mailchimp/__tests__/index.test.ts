import { Sender } from '../index';
import { Mail } from '../../Mail';
import { BASE64_GIF } from '../../../../../utils/string';
import { MailChimpResponseT } from '../entities';
import { ProviderResponseT } from '../../entities';

describe('sender flow', () => {
  test('send email should return a coherent bodyPost', async () => {
    const fakeRquest = jest.fn();
    const mail = new Mail();
    const resourceId = await mail.attachImage(Buffer.from(BASE64_GIF, 'base64'), 'myEmbeddedImage');

    mail
      .setHTML(`<h1>Hello World</h1><p>This is an image: <img src="cid:${resourceId}" alt="embedded image"></p>`)
      .setPlainText('Hello world this is an image: embedded image')
      .setFrom({ address: 'test@test.it', name: 'Test' })
      .addTo({ address: 'to@test.it', name: 'receiver test' })
      .setSubject('My subject');
    const mockedResponse: MailChimpResponseT = {
      _id: '123',
      email: 'to@test.it',
      status: 'sent',
    };
    const sender = new Sender('justTestApiKey');
    fakeRquest.mockImplementation(() => [mockedResponse]);
    const response = await sender.send(mail, fakeRquest);
    const expectedResponse: ProviderResponseT = {
      status: 'success',
      message: {
        fails: {},
        success: { 'to@test.it': '123' },
        pending: {},
        extra: 'to@test.it sent\n',
      },
    };
    expect(response).toStrictEqual(expectedResponse);
  });
});
