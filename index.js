var monthGoals = [
  {
    year: 2024,
    goals: ['10000', '100000', '200000', '20000', '', '', '', '', '100', '31000', '100000', '']
  }
]

var projects = [
  {
    payments: [
      {
        date: '09.2024',
        paid: true,
        payment: '10'
      },
      {
        date: '10.2024',
        paid: false,
        payment: '10'
      }
    ],
    projectName: 'Projekt 2'
  },
  {
    payments: [
      {
        date: '10.2024',
        paid: true,
        payment: '10000'
      },
      {
        date: '11.2024',
        paid: false,
        payment: '2000'
      }
    ],
    projectName: 'Projekt 1'
  },
  {
    payments: [
      {
        date: '09.2024',
        paid: true,
        payment: '10'
      },
      {
        date: '10.2024',
        paid: false,
        payment: '10'
      }
    ],
    projectName: 'Projekt 2'
  },
  {
    payments: [
      {
        date: '10.2024',
        paid: true,
        payment: '10000'
      },
      {
        date: '11.2024',
        paid: false,
        payment: '2000'
      }
    ],
    projectName: 'Projekt 1'
  },
  {
    payments: [
      {
        date: '09.2024',
        paid: true,
        payment: '10'
      },
      {
        date: '10.2024',
        paid: false,
        payment: '10'
      }
    ],
    projectName: 'Projekt 2'
  },
  {
    payments: [
      {
        date: '10.2024',
        paid: true,
        payment: '10000'
      },
      {
        date: '11.2024',
        paid: false,
        payment: '2000'
      }
    ],
    projectName: 'Projekt 1'
  }
]

var year = new Date().getFullYear()

var monthGoal = monthGoals.find(mg => mg.year === year)

const getSumByMonth = projects => {
  const overview = Array(11).fill(0)

  projects.forEach(p => {
    const [month, paymentYear] = p.date.split('.')

    if (paymentYear === year.toString()) {
      const monthIndex = parseFloat(month) - 1
      overview[monthIndex] += parseFloat(p.payment)
    }
  })
  return overview
}

// var currentProjects = filterProjectsByMonth(projects, year, month)
//

var currentProject = projects.flatMap(project => project.payments).filter(pay => pay.paid)

var sum = getSumByMonth(currentProject)
