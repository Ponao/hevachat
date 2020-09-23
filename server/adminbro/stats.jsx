import React, {useState} from 'react'
import { Box, Text, useCurrentAdmin } from 'admin-bro'
import { LineChart, BarChart , Legend, CartesianGrid, XAxis, YAxis, Bar, Tooltip } from 'recharts'

const months = [
    'Январь',
    'Февраль',
    'Март',
    'Апрель',
    'Май',
    'Июнь',
    'Июль',
    'Август',
    'Сентябрь',
    'Октябрь',
    'Ноябрь',
    'Декабрь',
]

let langPartials = {rus: 'Русский', eng: 'Английский'}

let tariffsPartials = {uv: 'Оплаченные', pv: 'Неоплаченные'}

const renderCustomBarLabel = ({ payload, x, y, width, height, value }) => {
    return <text x={x + width / 2} y={y} fill="#666" textAnchor="middle" dy={-6}>{`${value}`}</text>;
}

const Dashboard = () =>  {
    const [userStats, setUserStats] = useState(false);
    const [usersCount, setUserCount] = useState(false);
    const [paymentStats, setPaymentStats] = useState(false);
    const [moneyStats, setMoneyStats] = useState(false);
    const [roomsStats, setRoomsStats] = useState(false);
    const [roomsUsersStats, setRoomsUsersStats] = useState(false);
    const [tariffs, setTariffs] = useState(false);
    const admin = useCurrentAdmin()

    if(!userStats) {
        setUserStats(true)
        fetch(`${window.location.origin}/api/stats/get-users`, {
            method: "post",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                admin: admin[0]
            })
        })
        .then(response => response.json())
        .then(data => {
            let stats = []

            for (let i = 0; i < months.length; i++) {
                stats.push({name: months[i], uv: 0})
                data.users.map(x => {
                    if(months[i] === months[x._id.month-1])
                        stats[i].uv = x.count
                })
            }
            
            setUserStats(stats)
            setUserCount(data.count)
        })
    }

    if(!paymentStats) {
        setPaymentStats(true)
        fetch(`${window.location.origin}/api/stats/get-payments`, {
            method: "post",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                admin: admin[0]
            })
        })
        .then(response => response.json())
        .then(data => {
            let stats = []
            let money = []
            
            data.tariffs.map(x => {
                stats.push({name: x.title, uv: '0', pv: '0'})
                money.push({name: x.title, uv: 0})
            })

            data.payments.map(x => {
                stats.map((y, i) => {
                    if(y.name === x._id.tariff[0]) {
                        if(x._id.status === 'success')
                            stats[i].uv = Number(x.count)
                        else
                            stats[i].pv = Number(x.count)
                    }
                })

                money.map((y, i) => {
                    if(y.name === x._id.tariff[0]) {
                        if(x._id.status === 'success')
                        money[i].uv += Number(x._id.price)
                    }
                })
            })

            
            setPaymentStats(stats)
            setMoneyStats(money)
            setTariffs(data.tariffs)
        })
    }

    if(!roomsStats) {
        setRoomsStats(true)
        fetch(`${window.location.origin}/api/stats/get-rooms`, {
            method: "post",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
                admin: admin[0]
            })
        })
        .then(response => response.json())
        .then(data => {
            let rooms = []
            let users = []

            data.rooms.map(x => {
                rooms.push({name: langPartials[x._id.lang], uv: x.count})
            })

            data.users.map(x => {
                users.push({name: langPartials[x._id], uv: x.count})
            })
            
            setRoomsStats(rooms)

            setRoomsUsersStats(users)
        })
    }

    return (
        <Box backgroundColor={"#fff"} minHeight={'calc(100vh - 64px)'} height={'max-content'}>
            <div style={{display: 'flex'}}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text paddingLeft={'63px'} fontSize={18}>Новые пользователи</Text>
                    <BarChart  width={1000} height={400} data={userStats}>
                        <CartesianGrid stroke="#ccc" />
                        <YAxis />
                        <XAxis dataKey="name" />
                        <Bar 
                            dataKey="uv" 
                            barSize={30} 
                            fill="#008ff7"
                            label={renderCustomBarLabel}
                        />
                    </BarChart>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 10}}>
                    <Text fontSize={18}>Всего пользователей</Text>
                    <Text fontSize={16}>{usersCount}</Text>
                </div>
            </div>

            <div style={{display: 'flex'}}>
                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text paddingLeft={'63px'} fontSize={18}>Заказы</Text>
                    <BarChart  width={500} height={400} data={paymentStats}>
                        <CartesianGrid stroke="#ccc" />
                        <YAxis />
                        <XAxis dataKey="name" />
                        <Bar 
                            dataKey="uv" 
                            barSize={30} 
                            fill="#008ff7"
                            label={renderCustomBarLabel}
                        />
                        <Bar 
                            dataKey="pv" 
                            barSize={30} 
                            fill="#ff4444"
                            label={renderCustomBarLabel}
                        />
                        <Legend formatter={(value) => tariffsPartials[value]}/>
                    </BarChart>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text paddingLeft={'63px'} fontSize={18}>Доход</Text>
                    <BarChart  width={500} height={400} data={moneyStats}>
                        <CartesianGrid stroke="#ccc" />
                        <YAxis />
                        <XAxis dataKey="name" />
                        <Bar 
                            dataKey="uv" 
                            barSize={30} 
                            fill="#008ff7"
                            label={renderCustomBarLabel}
                        />
                    </BarChart>
                </div>

                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', marginLeft: 10}}>
                    <Text fontSize={18}>Цена тарифов</Text>
                    {!!tariffs && tariffs.map((x, i) => {
                        return <p key={i}>{x.title} - {x.price}</p>
                    })}
                </div>
            </div>

            <div style={{display: 'flex', backgroundColor: '#fff'}}>
            <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text paddingLeft={'63px'} fontSize={18}>Комнаты</Text>
                    <BarChart  width={500} height={400} data={roomsStats}>
                        <CartesianGrid stroke="#ccc" />
                        <YAxis />
                        <XAxis dataKey="name" />
                        <Bar 
                            dataKey="uv" 
                            barSize={30} 
                            fill="#008ff7"
                            label={renderCustomBarLabel}
                        />
                    </BarChart>
                </div>

                <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Text paddingLeft={'63px'} fontSize={18}>Пользователи в комнатах</Text>
                    <BarChart  width={500} height={400} data={roomsUsersStats}>
                        <CartesianGrid stroke="#ccc" />
                        <YAxis />
                        <XAxis dataKey="name" />
                        <Bar 
                            dataKey="uv" 
                            barSize={30} 
                            fill="#008ff7"
                            label={renderCustomBarLabel}
                        />
                    </BarChart>
                </div>
            </div>
        </Box>
    )
}

export default Dashboard