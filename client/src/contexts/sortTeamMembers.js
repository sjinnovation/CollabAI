export const sortTeamMembers = (members) => {
    const jobOrder = [
      "Assistant Manager",
      "Assistant Technical Manager",
      "Team Lead",
      "Project Manager",
      "Senior Developer",
      "Developer",
      "Junior Developer"
    ];
  
    return members.sort((a, b) => {
      const jobOrderA = jobOrder.indexOf(a.jobTitle);
      const jobOrderB = jobOrder.indexOf(b.jobTitle);
      if (jobOrderA !== jobOrderB) return jobOrderA - jobOrderB;
      return b.experience - a.experience;
    });
  };
  