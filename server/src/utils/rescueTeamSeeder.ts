import RescueTeam from '../models/RescueTeam';
import User from '../models/User';

export const DEMO_RESCUE_TEAMS = [
  {
    teamId: 'RSC-ALPHA',
    name: 'Rescue Squad Alpha',
    teamLeader: 'Capt. Rajesh Sharma',
    numberOfMembers: 6,
    contactNumber: '+91 98765 43210',
    currentLocation: 'Guwahati River Base Station 1',
    skills: ['Swiftwater Rescue', 'Deep-Water Boat Ops', 'Medical Evacuation', 'Night Search'],
    vehicleAssigned: 'Motorized Inflatable Boat + 4x4 All-Terrain Truck',
    status: 'AVAILABLE' as const
  },
  {
    teamId: 'RSC-BRAVO',
    name: 'Rescue Squad Bravo',
    teamLeader: 'Lt. Sunita Gogoi',
    numberOfMembers: 5,
    contactNumber: '+91 98765 43211',
    currentLocation: 'Silchar Staging Ground',
    skills: ['Urban Flooding Evacuation', 'Elderly/Special Needs Transit', 'First Aid Trauma Support'],
    vehicleAssigned: 'Heavy Duty Disaster Response Boat + Ambulance Van',
    status: 'AVAILABLE' as const
  },
  {
    teamId: 'RSC-RIVER-01',
    name: 'River Rescue Team 01',
    teamLeader: 'Sub-Inspector Bikram Das',
    numberOfMembers: 4,
    contactNumber: '+91 98765 43212',
    currentLocation: 'Brahmaputra Flood Embankment Unit',
    skills: ['Extreme Current Navigation', 'Underwater Recovery', 'Helicopter Winch Assist'],
    vehicleAssigned: 'Rigid-Hull Inflatable Boat (RHIB-800)',
    status: 'AVAILABLE' as const
  },
  {
    teamId: 'RSC-ERT-02',
    name: 'Emergency Response Team 02',
    teamLeader: 'Paramedic Ananya Bora',
    numberOfMembers: 4,
    contactNumber: '+91 98765 43213',
    currentLocation: 'Dibrugarh Forward Operating Base',
    skills: ['Emergency Triage', 'Submerged House Extraction', 'Rope Rescue Systems'],
    vehicleAssigned: 'Amphibious All-Terrain Vehicle (ARGO 8x8)',
    status: 'AVAILABLE' as const
  },
  {
    teamId: 'RSC-AFRU-05',
    name: 'Assam Flood Rescue Unit',
    teamLeader: 'Commander Pradip Barman',
    numberOfMembers: 8,
    contactNumber: '+91 98765 43214',
    currentLocation: 'Kaziranga High Grounds Camp',
    skills: ['Large Population Evacuation', 'Livestock & Citizen Safeguard', 'Logistics Airlift'],
    vehicleAssigned: '2x Heavy Pontoon Barges + Tactical Rescue Hauler',
    status: 'AVAILABLE' as const
  }
];

export const ensureDemoRescueTeams = async (): Promise<void> => {
  try {
    const rescueDemoUser = await User.findOne({
      $or: [{ email: 'rescue@floodrelief.demo' }, { roleName: 'rescue' }, { role: 'rescue' }]
    });

    for (const teamData of DEMO_RESCUE_TEAMS) {
      const existing = await RescueTeam.findOne({ teamId: teamData.teamId });
      if (!existing) {
        await RescueTeam.create({
          ...teamData,
          userId: teamData.teamId === 'RSC-ALPHA' && rescueDemoUser ? rescueDemoUser._id : undefined
        });
        console.log(`[Seed] Created rescue team: ${teamData.name} (${teamData.teamId})`);
      } else {
        // Link demo user to Alpha if not linked yet
        if (teamData.teamId === 'RSC-ALPHA' && rescueDemoUser && !existing.userId) {
          existing.userId = rescueDemoUser._id as any;
          await existing.save();
        }
      }
    }
  } catch (error) {
    console.error('Failed to seed demo rescue teams:', error);
  }
};
