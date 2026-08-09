import React from 'react';
import SystemCard from './SystemCard';
import '../style/SystemList.css';

export default function SystemList({ services = [], onSelectService }) {
  return (
    <div className="system-list-cards">
      {services.map((service) => (
        <SystemCard key={service.id} service={service} onSelectService={onSelectService} />
      ))}
    </div>
  );
}
