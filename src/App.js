import { useEffect, useState } from 'react';
import {
  urlClient,
  LENS_HUB_CONTRACT_ADDRESS,
  queryRecommendedProfiles,
  queryExplorePublications,
} from './queries';
import LENSHUB from './lenshub';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { Box, Button, Image, useColorModeValue } from '@chakra-ui/react';
import { ColorModeSwitcher } from './ColorModeSwitcher';

function App() {
  const [account, setAccount] = useState(null);
  console.log('🚀 ~ account:', account);
  const [profiles, setProfiles] = useState([]);
  console.log('🚀 ~ profiles:', profiles);
  const [posts, setPosts] = useState([]);
  console.log('🚀 ~ posts:', posts);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', newAccounts => {
        setAccount(newAccounts[0]);
      });
    }
    // Fetch recommended profiles and posts
    getRecommendedProfiles();
    getPosts();
  }, []);

  useEffect(() => {
    // Iterate over posts and load images with a delay
    posts.forEach(async (post, index) => {
      await loadImageWithDelay(post);
      if (index < posts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    });
  }, [posts]);

  async function signIn() {
    try {
      if (!window.ethereum) {
        throw new Error('Ethereum provider not available');
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      setAccount(accounts[0]); // Update the account state
    } catch (error) {
      console.error('Error signing in:', error);
    }
    console.log('Ethereum object:', window.ethereum);
  }

  async function getRecommendedProfiles() {
    try {
      const response = await urlClient
        .query(queryRecommendedProfiles)
        .toPromise();
      const recommendedProfiles = response.data.recommendedProfiles.slice(0, 5);
      recommendedProfiles.forEach(profile =>
        console.log('Recommended Profile:', profile)
      ); // Check the profiles in the console
      setProfiles(recommendedProfiles);
    } catch (error) {
      console.error('Error fetching recommended prof:', error);
    }
  }

  // async function getRecommendedProfiles() {
  //   try {
  //     const response = await urlClient.query(queryRecommendedProfiles).toPromise();
  //     if (response.error) {
  //       console.error("Error in GraphQL response:", response.error);
  //     } else {
  //       const recommendedProfiles = response.data.recommendedProfiles;
  //       console.log("Recommended Profiles:", recommendedProfiles.slice(0, 5));
  //       setProfiles(recommendedProfiles.slice(0, 5));
  //     }
  //   } catch (error) {
  //     console.error("Error fetching recommended profiles:", error);
  //   }
  // }

  async function getPosts() {
    const response = await urlClient
      .query(queryExplorePublications)
      .toPromise();

    const posts = response.data.explorePublications.items.filter(post => {
      if (post.profile) return post;
      return '';
    });
    setPosts(posts);
  }

  async function follow(id) {
    try {
      if (!account) {
        throw new Error('Account not available');
      }

      // MetaMask injects a Web3 Provider as "web3.currentProvider"
      // Wrap it up in the ethers.js Web3Provider
      const provider = new Web3Provider(window.ethereum); // Use Web3Provider

      // There is only ever up to one account in MetaMask exposed
      const signer = provider.getSigner();

      const contract = new ethers.Contract(
        LENS_HUB_CONTRACT_ADDRESS,
        LENSHUB,
        signer
      );

      // Assuming `id` is the user's ID you want to follow
      const tx = await contract.follow([parseInt(id)], [account]);
      console.log('🚀 ~ tx:', tx);
      // const tx = await contract.follow([parseInt(id)], [0x0]);
      await tx.wait();
    } catch (error) {
      console.error('Error following:', error);
    }
  }

  useEffect(() => {
    getRecommendedProfiles();
    getPosts();
  }, []);

  const parseImageUrl = profile => {
    if (profile) {
      const url = profile.picture?.original?.url;
      if (url && url.startsWith('ipfs:')) {
        const ipfsHash = url.split('//')[1]; // grabbing the `Request URL`
        return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      }

      return url;
    }

    return '/src/';
  };

  const loadImageWithDelay = async post => {
    if (post.profile) {
      const imageUrl = parseImageUrl(post.profile);
      // const img = new img();
      // img.src = imageUrl;
      // await img.decode();
    }
  };

  const blockExplorerUrl = 'https://etherscan.io/address/';
  const bw = useColorModeValue('black', 'pink');
  const bright = useColorModeValue('brightness(0.3)','brightness(1)'); // Adjust brightness based on color mode
  const contrast = useColorModeValue('contrast(0.5)', 'opacity(0.5)');
  const color = useColorModeValue('#808080', '#f7f7f7');

  return (
    <div className="app">
      {/* NAVBAR */}
      <Box width="100%" backgroundColor={useColorModeValue("rgba(5, 32, 64, ), rgba(5, 32, 64, 75)")}>
        <Box
          display="flex"
          flexDirection={{ base: 'column', md: 'row' }} // Stack on small screens, row on medium and larger screens
          justifyContent="space-between"
          alignItems="center"
          width="55%"
          margin="auto"
          color="pink"
          padding="10px 0" // 10 pixels up/down
        >
          <Box>
            <Box
              fontFamily="DM Serif Display"
              fontSize={{ base: '28px', md: '44px' }} // Different font size for different screens
              fontStyle="italic"
              textShadow="1px 1px 2px #fff"
              padding={{ base: '10px 0', md: '0' }} // Adjust padding for different screens
              color={useColorModeValue('black', 'pink')} // Set color based on color mode
            >
              DE_￠ENTRA
            </Box>
            <Box 
              color={useColorModeValue('black', 'pink')} 
              fontSize={{ base: '10px', md: '1rem' }} // Adjust padding for different screens
              paddingBottom={{ base: '10px', md: '0' }}
            > Decentralized Social Media App</Box>
          </Box>
          
          {account ? (
            <Box 
              backgroundColor="#000" 
              padding="15px 15px" 
              borderRadius="6px"
              >
              Connected
            </Box>
          ) : (
            <Box display="flex" justifySelf="flex-end">
              <Button
                onClick={signIn}
                color="rgba(5,32,64)"
                _hover={{ backgroundColor: '#808080' }}
              >
                Connect
              </Button>
              <ColorModeSwitcher />
            </Box>
          )}
        </Box>
      </Box>

      {/* CONTENT */}
      <Box
        display="flex"
        flexDirection="column" // Change to column layout on smaller screens
        alignItems="center" // Center content on smaller screens
        width="100%" // Full width
        padding="15px" // Add some padding for spacing
      >
        {/* POSTS */}
        <Box width="100%" maxWidth="100%" minWidth="100%">
          {posts.map(post => (
            <Box
              key={post.id}
              marginBottom="25px"
              backgroundColor="rgba(255, 192, 202, 0.4)"
              padding="40px 30px 40px 25px"
              borderRadius="6px"
            >
              <Box display="flex">
                {/* PROFILE IMAGE */}
                <Box width="75px" height="75px" marginTop="8px">
                  <a
                    href={blockExplorerUrl + post.profile.followNftAddress} // Append the post ID to the base URL
                    target="_blank"
                    rel="noopener noreferrer" // Open link in a new tab
                  >
                    <img
                      alt="profile"
                      src={parseImageUrl(post.profile)} // post.profile may not exist, run parseImageUrl check
                      width="75px"
                      height="75px"
                      onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = '/default-avatar.png';
                      }}
                      // onClick={(e) => {
                      //   e.preventDefault();
                      //   console.log("Post id:", post.id);
                      // }}
                      style={{ cursor: 'pointer' }}
                    />
                  </a>
                </Box>

                {/* POST CONTENT */}
                <Box flexGrow={1} marginLeft="20px">
                  <Box display="flex" justifyContent="space-between">
                    <Box fontFamily="DM Serif Display" fontSize="24px">
                      {post.profile?.handle}
                    </Box>
                    <Box
                      height="50px"
                      _hover={{ cursor: 'pointer' }}
                      color={bw}
                    >
                      <Image
                        alt="follow-icon"
                        src="/follow-icon.png"
                        width={{ base: '3rem', md: '50px' }}
                        height={{ base: '4.5rem', md: '50px' }}
                        position={{ base: 'relative', md: 'initial'}}
                        bottom={{ base: "1rem", md: "0"}}
                        onClick={() => follow(post.id)}
                        padding={{ base: '10px 0', md: '0' }} // Adjust padding for different screens
                        style={{
                          filter: bright, // Adjust brightness based on color mode
                        }}
                      />
                    </Box>
                  </Box>
                  <Box overflowWrap="anywhere" fontSize="1rem">
                    {post.metadata?.content}
                  </Box>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>

        {/* FRIEND SUGGESTIONS */}
        <Box
          width="100%"
          backgroundColor="rgba(5, 32, 64, 28)"
          padding="20px" // Adjust padding for spacing
          borderRadius="6px"
          marginTop="20px" // Add some spacing between sections
          // height="fit-conent"
        >
          <Box
            fontFamily="DM Serif Display"
            fontSize="1.25rem"
            marginBottom="10px"
            color={useColorModeValue('aliceblue', 'pink')}
            style={{
              filter: contrast,
            }}     
          >
            FRIEND SUGGESTIONS
          </Box>
          <Box>
            {profiles.map((profile, i) => (
              <Box
                key={profile.id}
                margin="30px 0"
                display="flex"
                alignItems="center"
                height="40px"
                _hover={{
                  color: color, // Adjust colors based on color mode
                  cursor: 'pointer',
                }}
                _click={() => console.log('Clicked')}
              >
                <img
                  alt="profile"
                  src={parseImageUrl(profile)}
                  width="40px"
                  height="40px"
                  onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = '/default-avatar.png';
                  }}
                  style={{
                    filter: bright,
                  }}                  
                />
                <Box marginLeft="15px">
                  <h4>{profile.name}</h4>
                  <p>{profile.handle}</p>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </div>
  );
}

export default App;
