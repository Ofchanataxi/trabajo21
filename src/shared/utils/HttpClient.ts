import axios from 'axios';

async function HttpClient(
  url: string,
  data: object,
  accessToken: string,
): Promise<any> {
  const options = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  };

  //console.log(`request made to ${url} at: ` + new Date().toString());

  try {
    const response = await axios.post(url, data, options);
    return await response.data;
  } catch (error: any) {
    throw new Error(error);
  }
}
export default HttpClient;
