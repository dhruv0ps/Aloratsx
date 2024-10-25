import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { AgentWithData as Agent } from '../config/models/agent';
import { agentApis } from '../config/apiRoutes/agentApi';

interface AutocompleteAgentProps {
    onSelect: (agent: Agent) => void;
    value: Agent | null;
}

const AutocompleteAgent: React.FC<AutocompleteAgentProps> = ({ onSelect, value }) => {
    const [query, setQuery] = useState(value ? value.name : '');
    const [agents, setAgents] = useState<Agent[]>([]);
    const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const response = await agentApis.getAllAgents();
                if (response.status) {
                    const data = response.data.filter((agent: Agent) => agent.status === 'ACTIVE');
                    setAgents(data);
                    setFilteredAgents(data);
                }
            } catch (error) {
                console.error('Error fetching agents:', error);
                toast.error('Failed to fetch agents');
            }
        };

        fetchAgents();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setQuery(value);
        setIsOpen(true);
        const filtered = agents.filter((agent) =>
            agent.name.toLowerCase().includes(value.toLowerCase()) ||
            agent.number.toLowerCase().includes(value.toLowerCase()) ||
            agent.email.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredAgents(filtered);
    };

    const handleSelect = (agent: Agent) => {
        setQuery(agent.name);
        setIsOpen(false);
        onSelect(agent);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                placeholder={agents.length > 0 ? "Search agents by name, number, or email" : "No agents found"}
                className="w-full p-2 border rounded border-gray-300"
            />
            {isOpen && filteredAgents.length > 0 && (
                <ul className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-60 overflow-auto">
                    {filteredAgents.map((agent, index) => (
                        <li
                            key={index}
                            onClick={() => handleSelect(agent)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                        >
                            {agent.name} ({agent.number}) - {agent.email}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AutocompleteAgent;
