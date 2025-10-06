// Test script to simulate frontend post creation
const testPostCreation = async () => {
  const postData = {
    title: "Test Post from Console",
    content: "This is test content",
    excerpt: "Test excerpt",
    category_id: 3,
    featured_image: "https://cdn.britannica.com/84/203584-050-57D326E5/speed-internet-technology-background.jpg",
    is_published: false
  };

  console.log('Sending post data:', postData);

  try {
    const response = await fetch('http://localhost:8000/api/v1/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + localStorage.getItem('auth_token')
      },
      body: JSON.stringify(postData)
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Post created successfully!');
    } else {
      console.log('❌ Post creation failed:', data);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Run the test
testPostCreation();