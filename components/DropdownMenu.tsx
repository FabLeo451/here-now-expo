import React, { useState } from 'react';
import { Layout, Select, SelectItem, SelectProps } from '@ui-kitten/components';

const data = ['Opzione 1', 'Opzione 2', 'Opzione 3'];

export default function DropdownMenu(): JSX.Element {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const onSelect = (index: SelectProps['selectedIndex']) => {
    setSelectedIndex(index as number);
  };

  return (
    <Layout style={{ padding: 16 }}>
      <Select
        placeholder="Seleziona un'opzione"
        value={selectedIndex !== null ? data[selectedIndex] : undefined}
        selectedIndex={selectedIndex}
        onSelect={onSelect}
      >
        {data.map((title) => (
          <SelectItem key={title} title={title} />
        ))}
      </Select>
    </Layout>
  );
}
