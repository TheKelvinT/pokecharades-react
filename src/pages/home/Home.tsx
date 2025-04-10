import React, { useState } from 'react';
import {
  Button,
  Card,
  Carousel,
  Col,
  Layout,
  Menu,
  Modal,
  Row,
  Space,
  Tag,
  Typography,
  theme,
  message,
} from 'antd';
import {
  UserOutlined,
  LoginOutlined,
  FacebookOutlined,
  TwitterOutlined,
  InstagramOutlined,
  CopyOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/new.png';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// Sample data - replace with actual data from your API
const featuredPartners = [
  {
    id: 1,
    name: 'Pokemon Center',
    image: 'https://images.unsplash.com/photo-1613771404784-3a5686aa2be3?q=80&w=1200',
    description: 'Official Pokemon merchandise and collectibles store with exclusive items',
    category: 'Trading Cards',
  },
  {
    id: 2,
    name: 'Card Kingdom',
    image:
      'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=3269&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Premium trading card store specializing in rare and vintage cards',
    category: 'Trading Cards',
  },
  {
    id: 3,
    name: "Collector's Haven",
    image:
      'https://images.unsplash.com/photo-1709309009523-989b1522800f?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    description: 'Your one-stop shop for all collectible card games and accessories',
    category: 'Collectibles',
  },
];

const categories = [
  'Trading Cards',
  'Collectibles',
  'Merchandise',
  'Games',
  'Accessories',
  'Limited Editions',
];

const exclusivePartners = [
  {
    id: 1,
    name: 'Elite Card Shop',
    image: 'https://images.unsplash.com/photo-1514863775978-c611132e6691?q=80&w=800',
    categories: ['Trading Cards', 'Premium'],
    code: 'POKECHARADES15',
    description:
      'Premium card collection store with rare finds and expert grading services. We specialize in Pokemon, Yu-Gi-Oh!, and Magic: The Gathering cards.',
    website: 'https://example.com',
    socials: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    location: {
      address: '123 Card Street, Pokemon City',
      coordinates: { lat: 40.7128, lng: -74.006 },
    },
    features: [
      'Expert card grading services',
      'Weekly trading events',
      'Rare card auctions',
      'Card protection supplies',
    ],
    openingHours: {
      weekdays: '9:00 AM - 8:00 PM',
      weekends: '10:00 AM - 6:00 PM',
    },
    contact: {
      phone: '+1 (555) 123-4567',
      email: 'info@elitecardshop.com',
    },
  },
  {
    id: 2,
    name: 'Collectors Corner',
    image:
      'https://images.unsplash.com/photo-1709309009523-989b1522800f?q=80&w=3270&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    categories: ['Collectibles', 'Vintage'],
    code: 'COLLECT20',
    description:
      'Specializing in rare and vintage collectibles, featuring authenticated items and limited editions.',
    website: 'https://example.com/collectors',
    socials: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    location: {
      address: '456 Collector Ave, Trading Town',
      coordinates: { lat: 34.0522, lng: -118.2437 },
    },
    features: [
      'Authentication services',
      'Display cases and supplies',
      'Monthly collector meetups',
      'Consignment services',
    ],
    openingHours: {
      weekdays: '10:00 AM - 7:00 PM',
      weekends: '11:00 AM - 5:00 PM',
    },
    contact: {
      phone: '+1 (555) 987-6543',
      email: 'info@collectorscorner.com',
    },
  },
  {
    id: 3,
    name: 'Gaming Galaxy',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800',
    categories: ['Games', 'Accessories'],
    code: 'GALAXY25',
    description:
      'Your gateway to the gaming universe. We offer the latest games, accessories, and gaming merchandise.',
    website: 'https://example.com/galaxy',
    socials: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    location: {
      address: '789 Gaming Blvd, Console City',
      coordinates: { lat: 51.5074, lng: -0.1278 },
    },
    features: ['Gaming tournaments', 'Trade-in programs', 'Gaming accessories', 'Loyalty rewards'],
    openingHours: {
      weekdays: '11:00 AM - 9:00 PM',
      weekends: '10:00 AM - 10:00 PM',
    },
    contact: {
      phone: '+1 (555) 456-7890',
      email: 'info@gaminggalaxy.com',
    },
  },
  {
    id: 4,
    name: 'Retro Haven',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800',
    categories: ['Vintage', 'Games', 'Trading Cards'],
    code: 'RETRO30',
    description:
      'Step into nostalgia with our curated collection of retro games and vintage trading cards.',
    website: 'https://example.com/retro',
    socials: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    location: {
      address: '321 Vintage Lane, Retro City',
      coordinates: { lat: 35.6762, lng: 139.6503 },
    },
    features: [
      'Vintage card restoration',
      'Retro gaming events',
      'Collection appraisals',
      'Trading community',
    ],
    openingHours: {
      weekdays: '11:00 AM - 7:00 PM',
      weekends: '12:00 PM - 8:00 PM',
    },
    contact: {
      phone: '+1 (555) 789-0123',
      email: 'info@retrohaven.com',
    },
  },
  {
    id: 5,
    name: 'Digital Deck Masters',
    image: 'https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?q=80&w=800',
    categories: ['Digital Cards', 'Games'],
    code: 'DIGITAL10',
    description:
      'Leading platform for digital card games and online tournaments with exclusive digital collectibles.',
    website: 'https://example.com/digital',
    socials: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    location: {
      address: '567 Digital Drive, Tech Valley',
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    features: [
      'Online tournaments',
      'Digital card trading',
      'Live streaming events',
      'Premium memberships',
    ],
    openingHours: {
      weekdays: '24/7 Online Support',
      weekends: '24/7 Online Support',
    },
    contact: {
      phone: '+1 (555) 234-5678',
      email: 'support@digitaldeck.com',
    },
  },
  {
    id: 6,
    name: 'Mystic Cards & More',
    image:
      'https://images.unsplash.com/photo-1613771404721-1f92d799e49f?q=80&w=3269&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    categories: ['Limited Editions', 'Trading Cards'],
    code: 'MYSTIC50',
    description:
      'Exclusive dealer of limited edition cards and mystical collectibles from around the world.',
    website: 'https://example.com/mystic',
    socials: {
      facebook: 'https://facebook.com',
      twitter: 'https://twitter.com',
      instagram: 'https://instagram.com',
    },
    location: {
      address: '890 Mystic Road, Wonder City',
      coordinates: { lat: 48.8566, lng: 2.3522 },
    },
    features: [
      'Limited edition releases',
      'Pre-order services',
      'Collectors club',
      'Private showings',
    ],
    openingHours: {
      weekdays: '10:00 AM - 6:00 PM',
      weekends: 'By Appointment',
    },
    contact: {
      phone: '+1 (555) 901-2345',
      email: 'rare@mysticcards.com',
    },
  },
];

const Home: React.FC = () => {
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { token } = theme.useToken();

  // Theme colors based on the logo
  const brandColors = {
    primary: '#FFD700', // Yellow from logo
    secondary: '#000000', // Black from logo
    background: '#FFFFFF', // White background
  };

  const showPartnerModal = (partner: any) => {
    setSelectedPartner(partner);
    setIsModalVisible(true);
  };

  return (
    <Layout className="min-h-screen">
      {/* Navigation */}
      <Header style={{ background: brandColors.background, borderBottom: '1px solid #f0f0f0' }}>
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center">
            <img src={logo} alt="PokeCharades" className="h-12 mr-8" />
            <Menu mode="horizontal" defaultSelectedKeys={['home']}>
              <Menu.Item key="home">Home</Menu.Item>
              <Menu.Item key="partners">Partners</Menu.Item>
              <Menu.Item key="about">About</Menu.Item>
              <Menu.Item key="contact">Contact</Menu.Item>
            </Menu>
          </div>
          <Space>
            <Button icon={<LoginOutlined />}>Login</Button>
            <Button
              type="primary"
              icon={<UserOutlined />}
              style={{
                background: brandColors.primary,
                color: brandColors.secondary,
                borderColor: brandColors.secondary,
              }}
            >
              Sign Up
            </Button>
          </Space>
        </div>
      </Header>

      <Content>
        {/* Hero Carousel */}
        <Carousel autoplay className="mb-8">
          {featuredPartners.map(partner => (
            <div key={partner.id}>
              <div
                className="relative h-[400px] bg-cover bg-center"
                style={{ backgroundImage: `url(${partner.image})` }}
              >
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent text-white">
                  <Title level={2} style={{ color: brandColors.primary, margin: 0 }}>
                    {partner.name}
                  </Title>
                  <Text style={{ color: 'white' }}>{partner.description}</Text>
                </div>
              </div>
            </div>
          ))}
        </Carousel>

        {/* Categories */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <Title level={2} className="mb-6" style={{ color: brandColors.secondary }}>
            Browse Categories
          </Title>
          <Row gutter={[16, 16]}>
            {categories.map(category => (
              <Col key={category} xs={12} sm={8} md={6} lg={4}>
                <Card
                  hoverable
                  className="text-center"
                  style={{
                    borderColor: brandColors.primary,
                    transition: 'all 0.3s ease',
                    backgroundColor: 'white',
                  }}
                  bodyStyle={{
                    padding: '24px 12px',
                  }}
                  onClick={() => message.info(`Browsing ${category} category`)}
                >
                  <Text
                    strong
                    style={{
                      color: brandColors.secondary,
                      fontSize: '16px',
                    }}
                  >
                    {category}
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Exclusive Partners */}
        <div className="max-w-7xl mx-auto px-4 mb-12">
          <Title level={2} className="mb-6" style={{ color: brandColors.secondary }}>
            Exclusive Partners
          </Title>
          <Row gutter={[24, 24]}>
            {exclusivePartners.map(partner => (
              <Col key={partner.id} xs={24} sm={12} md={8}>
                <Card
                  className="h-full hover:shadow-lg transition-shadow duration-300"
                  bodyStyle={{
                    padding: '24px',
                    height: '400px',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  style={{ borderColor: '#f0f0f0' }}
                >
                  <div className="flex flex-col h-full">
                    <div className="h-[200px] mb-6">
                      <img
                        src={partner.image}
                        alt={partner.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                    <div className="flex flex-col flex-grow">
                      <Title level={4} className="mb-4 !mt-0">
                        {partner.name}
                      </Title>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {partner.categories.map((category, index) => (
                          <Tag
                            key={index}
                            style={{
                              backgroundColor: brandColors.primary,
                              color: brandColors.secondary,
                              border: `1px solid ${brandColors.secondary}`,
                            }}
                          >
                            {category}
                          </Tag>
                        ))}
                      </div>
                      <Button
                        type="primary"
                        onClick={() => showPartnerModal(partner)}
                        block
                        className="mt-auto"
                        style={{
                          background: brandColors.primary,
                          color: brandColors.secondary,
                          borderColor: brandColors.secondary,
                        }}
                      >
                        Get Code
                      </Button>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Partner Modal */}
        <Modal
          title={selectedPartner?.name}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={800}
          style={{
            top: 20,
          }}
          bodyStyle={{
            padding: '24px',
          }}
          className="custom-modal"
        >
          {selectedPartner && (
            <div>
              <img
                src={selectedPartner.image}
                alt={selectedPartner.name}
                className="w-full h-[300px] object-cover rounded mb-4"
              />
              <div className="flex items-center gap-4 mb-4">
                <div className="flex flex-wrap gap-2">
                  {selectedPartner.categories.map((category: string, index: number) => (
                    <Tag
                      key={index}
                      style={{
                        backgroundColor: brandColors.primary,
                        color: brandColors.secondary,
                        border: `1px solid ${brandColors.secondary}`,
                      }}
                    >
                      {category}
                    </Tag>
                  ))}
                </div>
                <Text type="secondary">
                  Open: {selectedPartner.openingHours.weekdays} (Weekdays)
                </Text>
              </div>
              <div className="mb-6">
                <Title level={4} style={{ color: brandColors.secondary }}>
                  Get 15% off when using this code:
                </Title>
                <div className="flex items-center gap-2 p-4 bg-gray-100 rounded">
                  <Text strong className="text-lg" style={{ color: brandColors.secondary }}>
                    {selectedPartner.code}
                  </Text>
                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => {
                      navigator.clipboard.writeText(selectedPartner.code);
                      message.success('Code copied to clipboard!');
                    }}
                    style={{
                      background: brandColors.primary,
                      color: brandColors.secondary,
                      borderColor: brandColors.secondary,
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              <div className="mb-6">
                <Title level={4} style={{ color: brandColors.secondary }}>
                  About Us
                </Title>
                <Text className="block mb-4">{selectedPartner.description}</Text>
                <Title level={5} style={{ color: brandColors.secondary }}>
                  Featured Services
                </Title>
                <ul className="list-disc pl-6 mb-4">
                  {selectedPartner.features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              <div className="mb-6">
                <Title level={4} style={{ color: brandColors.secondary }}>
                  Contact Information
                </Title>
                <Space direction="vertical" className="w-full">
                  <Text>
                    <strong>Phone:</strong> {selectedPartner.contact.phone}
                  </Text>
                  <Text>
                    <strong>Email:</strong> {selectedPartner.contact.email}
                  </Text>
                  <Text>
                    <strong>Address:</strong> {selectedPartner.location.address}
                  </Text>
                  <Text>
                    <strong>Hours:</strong>
                    <br />
                    Weekdays: {selectedPartner.openingHours.weekdays}
                    <br />
                    Weekends: {selectedPartner.openingHours.weekends}
                  </Text>
                </Space>
              </div>
              <Space direction="vertical" className="w-full">
                <Button
                  icon={<GlobalOutlined />}
                  href={selectedPartner.website}
                  target="_blank"
                  block
                  type="primary"
                  style={{
                    background: brandColors.primary,
                    color: brandColors.secondary,
                    borderColor: brandColors.secondary,
                  }}
                >
                  Visit Website
                </Button>
                <div className="flex justify-center gap-4 my-4">
                  <Button
                    icon={<FacebookOutlined />}
                    href={selectedPartner.socials.facebook}
                    target="_blank"
                    size="large"
                    style={{
                      background: brandColors.primary,
                      color: brandColors.secondary,
                      borderColor: brandColors.secondary,
                    }}
                  />
                  <Button
                    icon={<TwitterOutlined />}
                    href={selectedPartner.socials.twitter}
                    target="_blank"
                    size="large"
                    style={{
                      background: brandColors.primary,
                      color: brandColors.secondary,
                      borderColor: brandColors.secondary,
                    }}
                  />
                  <Button
                    icon={<InstagramOutlined />}
                    href={selectedPartner.socials.instagram}
                    target="_blank"
                    size="large"
                    style={{
                      background: brandColors.primary,
                      color: brandColors.secondary,
                      borderColor: brandColors.secondary,
                    }}
                  />
                </div>
                <div className="h-[200px] bg-gray-200 rounded">
                  {/* Google Maps integration placeholder */}
                  <div className="h-full flex items-center justify-center">
                    <Text type="secondary">Map View Coming Soon</Text>
                  </div>
                </div>
              </Space>
            </div>
          )}
        </Modal>
      </Content>

      <Footer style={{ background: brandColors.secondary, color: brandColors.background }}>
        <div className="max-w-7xl mx-auto">
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: brandColors.primary }}>
                About PokeCharades
              </Title>
              <Text style={{ color: brandColors.background }}>
                Your ultimate destination for collectible card games and merchandise.
              </Text>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: brandColors.primary }}>
                Quick Links
              </Title>
              <Space direction="vertical">
                <Link to="/about" style={{ color: brandColors.background }}>
                  About Us
                </Link>
                <Link to="/partners" style={{ color: brandColors.background }}>
                  Partners
                </Link>
                <Link to="/contact" style={{ color: brandColors.background }}>
                  Contact
                </Link>
              </Space>
            </Col>
            <Col xs={24} sm={8}>
              <Title level={4} style={{ color: brandColors.primary }}>
                Connect With Us
              </Title>
              <Space>
                <Button
                  icon={<FacebookOutlined />}
                  style={{
                    background: 'transparent',
                    borderColor: brandColors.primary,
                    color: brandColors.primary,
                  }}
                />
                <Button
                  icon={<TwitterOutlined />}
                  style={{
                    background: 'transparent',
                    borderColor: brandColors.primary,
                    color: brandColors.primary,
                  }}
                />
                <Button
                  icon={<InstagramOutlined />}
                  style={{
                    background: 'transparent',
                    borderColor: brandColors.primary,
                    color: brandColors.primary,
                  }}
                />
              </Space>
            </Col>
          </Row>
          <div className="mt-8 pt-4 border-t border-gray-700">
            <Text style={{ color: brandColors.background }}>
              © 2024 PokeCharades. All rights reserved.
            </Text>
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default Home;
