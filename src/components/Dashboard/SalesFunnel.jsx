import React, { useState, useRef } from 'react';
import { Plus, MoreHorizontal, Trash2, Pencil, GripVertical, DollarSign, X, Check } from 'lucide-react';
import { useFunnels } from '../../hooks/useFunnels';
import './SalesFunnel.css';

/* ──────────────── Label Colors ──────────────── */
const LABEL_STYLES = {
    hot: { bg: 'bg-red-500', text: 'Quente' },
    warm: { bg: 'bg-amber-500', text: 'Morno' },
    cold: { bg: 'bg-sky-400', text: 'Frio' },
    won: { bg: 'bg-emerald-500', text: 'Ganho' },
    lost: { bg: 'bg-gray-400', text: 'Perdido' },
};

/* ──────────────── Card Component ──────────────── */
const KanbanCard = ({ card, colId, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description);
    const [value, setValue] = useState(card.value);

    const handleSave = () => {
        onUpdate(colId, card.id, { title, description, value });
        setEditing(false);
    };

    return (
        <div
            draggable
            onDragStart={(e) => {
                e.dataTransfer.setData('cardId', card.id);
                e.dataTransfer.setData('fromColId', colId);
                e.currentTarget.classList.add('kanban-card-dragging');
            }}
            onDragEnd={(e) => {
                e.currentTarget.classList.remove('kanban-card-dragging');
            }}
            className="kanban-card group bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing relative"
        >
            {/* Drag handle */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300">
                <GripVertical size={14} />
            </div>

            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
                <div className="flex gap-1.5 mb-3">
                    {card.labels.map((label) => (
                        <div
                            key={label}
                            className={`h-2 w-10 rounded-full ${LABEL_STYLES[label]?.bg || 'bg-gray-300'}`}
                            title={LABEL_STYLES[label]?.text || label}
                        />
                    ))}
                </div>
            )}

            {editing ? (
                <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-sm font-semibold border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                    />
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={2}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        placeholder="Descrição..."
                    />
                    <input
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                        placeholder="R$ 0,00"
                    />
                    <div className="flex gap-2 pt-1">
                        <button onClick={handleSave} className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg font-medium hover:bg-purple-700 transition">
                            <Check size={12} /> Salvar
                        </button>
                        <button onClick={() => setEditing(false)} className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700 transition">
                            Cancelar
                        </button>
                    </div>
                </div>
            ) : (
                <div onDoubleClick={() => setEditing(true)}>
                    <h4 className="text-sm font-semibold text-gray-800 mb-1 pr-6">{card.title}</h4>
                    {card.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2 leading-relaxed">{card.description}</p>
                    )}
                    {card.value && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                            <DollarSign size={12} />
                            {card.value}
                        </div>
                    )}
                </div>
            )}

            {/* Actions */}
            {!editing && (
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
                        className="p-1 rounded-md hover:bg-gray-100 text-gray-400 hover:text-purple-600 transition"
                    >
                        <Pencil size={12} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(colId, card.id); }}
                        className="p-1 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            )}
        </div>
    );
};

/* ──────────────── Column Component ──────────────── */
const KanbanColumn = ({ column, onAddCard, onUpdateCard, onDeleteCard, onDeleteColumn, onRenameColumn, onMoveCard }) => {
    const [showAddCard, setShowAddCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [editingTitle, setEditingTitle] = useState(false);
    const [colTitle, setColTitle] = useState(column.title);
    const [dragOver, setDragOver] = useState(false);

    const handleAddCard = () => {
        if (!newCardTitle.trim()) return;
        onAddCard(column.id, { title: newCardTitle.trim() });
        setNewCardTitle('');
        setShowAddCard(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const cardId = e.dataTransfer.getData('cardId');
        const fromColId = e.dataTransfer.getData('fromColId');
        if (!cardId || !fromColId) return;
        const toIndex = column.cards.length;
        onMoveCard(fromColId, column.id, cardId, toIndex);
    };

    const handleCardDrop = (e, targetIndex) => {
        e.preventDefault();
        e.stopPropagation();
        setDragOver(false);
        const cardId = e.dataTransfer.getData('cardId');
        const fromColId = e.dataTransfer.getData('fromColId');
        if (!cardId || !fromColId) return;
        onMoveCard(fromColId, column.id, cardId, targetIndex);
    };

    const handleSaveTitle = () => {
        if (colTitle.trim()) {
            onRenameColumn(column.id, colTitle.trim());
        }
        setEditingTitle(false);
    };

    return (
        <div
            className={`kanban-column flex flex-col bg-[#f1f2f4] rounded-2xl min-w-[300px] max-w-[300px] max-h-[calc(100vh-180px)] transition-all duration-200 ${dragOver ? 'ring-2 ring-purple-400 ring-offset-2 bg-purple-50/50' : ''
                }`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 flex-shrink-0">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-offset-1"
                        style={{ backgroundColor: column.color, ringColor: column.color + '40' }}
                    />
                    {editingTitle ? (
                        <input
                            value={colTitle}
                            onChange={(e) => setColTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveTitle();
                                if (e.key === 'Escape') { setColTitle(column.title); setEditingTitle(false); }
                            }}
                            className="text-sm font-bold text-gray-800 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400 w-full"
                            autoFocus
                        />
                    ) : (
                        <button
                            className="group/title flex items-center gap-1.5 text-sm font-bold text-gray-800 truncate hover:text-purple-600 transition rounded-lg px-1.5 py-0.5 -mx-1.5 hover:bg-white/80"
                            onClick={() => setEditingTitle(true)}
                            title="Clique para editar"
                        >
                            <span className="truncate">{column.title}</span>
                            <Pencil size={12} className="flex-shrink-0 opacity-0 group-hover/title:opacity-100 transition-opacity text-gray-400" />
                        </button>
                    )}
                    <span className="text-xs text-gray-400 bg-gray-200/60 px-2 py-0.5 rounded-full font-semibold flex-shrink-0">
                        {column.cards.length}
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setShowAddCard(true)}
                        className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-purple-600 transition"
                        title="Adicionar cartão"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={() => {
                            if (confirm(`Excluir coluna "${column.title}" e todos os cartões?`)) {
                                onDeleteColumn(column.id);
                            }
                        }}
                        className="p-1 rounded-lg hover:bg-red-100 text-gray-400 hover:text-red-500 transition"
                        title="Excluir coluna"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2.5 kanban-scroll">
                {column.cards.map((card, index) => (
                    <div
                        key={card.id}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onDrop={(e) => handleCardDrop(e, index)}
                    >
                        <KanbanCard
                            card={card}
                            colId={column.id}
                            onUpdate={onUpdateCard}
                            onDelete={onDeleteCard}
                        />
                    </div>
                ))}

                {/* Add Card Form */}
                {showAddCard && (
                    <div className="bg-white rounded-xl p-3 shadow-sm border border-purple-200">
                        <input
                            value={newCardTitle}
                            onChange={(e) => setNewCardTitle(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                            placeholder="Título do cartão..."
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent mb-2"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={handleAddCard}
                                className="px-3 py-1.5 bg-purple-600 text-white text-xs rounded-lg font-medium hover:bg-purple-700 transition"
                            >
                                Adicionar
                            </button>
                            <button
                                onClick={() => { setShowAddCard(false); setNewCardTitle(''); }}
                                className="p-1.5 text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Column Footer: Add Card Button */}
            {!showAddCard && (
                <div className="px-3 pb-3 flex-shrink-0">
                    <button
                        onClick={() => setShowAddCard(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 transition font-medium"
                    >
                        <Plus size={16} />
                        Adicionar um cartão
                    </button>
                </div>
            )}
        </div>
    );
};

/* ──────────────── Main Sales Funnel Page ──────────────── */
const SalesFunnel = () => {
    const {
        funnels,
        activeFunnel,
        activeFunnelId,
        setActiveFunnelId,
        loading,
        addFunnel,
        deleteFunnel,
        renameFunnel,
        addColumn,
        deleteColumn,
        renameColumn,
        addCard,
        updateCard,
        deleteCard,
        moveCard,
    } = useFunnels();

    const [showNewFunnel, setShowNewFunnel] = useState(false);
    const [newFunnelName, setNewFunnelName] = useState('');
    const [showNewColumn, setShowNewColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');
    const [showFunnelMenu, setShowFunnelMenu] = useState(false);

    const handleAddFunnel = () => {
        if (!newFunnelName.trim()) return;
        addFunnel(newFunnelName.trim());
        setNewFunnelName('');
        setShowNewFunnel(false);
    };

    const handleAddColumn = () => {
        if (!newColumnTitle.trim()) return;
        addColumn(newColumnTitle.trim());
        setNewColumnTitle('');
        setShowNewColumn(false);
    };

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-[#f8f9fc] h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );

    return (
        <div className="sales-funnel flex-1 flex flex-col h-screen overflow-hidden bg-[#f8f9fc]">
            {/* ── Header ── */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Funnel Tabs */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            {funnels.length > 0 ? (
                                funnels.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setActiveFunnelId(f.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeFunnelId === f.id
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        {f.name}
                                    </button>
                                ))
                            ) : (
                                <span className="text-xs text-gray-400 px-4 py-2">Nenhum funil criado</span>
                            )}

                            {/* Add Funnel */}
                            {showNewFunnel ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        value={newFunnelName}
                                        onChange={(e) => setNewFunnelName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddFunnel()}
                                        placeholder="Nome do funil..."
                                        className="w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                                        autoFocus
                                    />
                                    <button onClick={handleAddFunnel} className="p-1.5 text-purple-600 hover:bg-purple-100 rounded-lg transition">
                                        <Check size={16} />
                                    </button>
                                    <button onClick={() => { setShowNewFunnel(false); setNewFunnelName(''); }} className="p-1.5 text-gray-400 hover:text-gray-600 transition">
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNewFunnel(true)}
                                    className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-gray-200 transition"
                                    title="Criar novo funil"
                                >
                                    <Plus size={16} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Stats */}
                        {activeFunnel && (
                            <div className="flex items-center gap-4 text-xs text-gray-500 mr-4">
                                <span>
                                    <strong className="text-gray-800">{activeFunnel.columns?.reduce((acc, c) => acc + (c.cards?.length || 0), 0) || 0}</strong> cartões
                                </span>
                                <span>
                                    <strong className="text-gray-800">{activeFunnel.columns?.length || 0}</strong> colunas
                                </span>
                            </div>
                        )}

                        {/* Funnel Actions */}
                        {activeFunnel && (
                            <div className="relative">
                                <button
                                    onClick={() => setShowFunnelMenu(!showFunnelMenu)}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition"
                                >
                                    <MoreHorizontal size={18} />
                                </button>
                                {showFunnelMenu && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setShowFunnelMenu(false)} />
                                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                            <button
                                                onClick={() => {
                                                    const name = prompt('Novo nome do funil:', activeFunnel?.name);
                                                    if (name) renameFunnel(activeFunnelId, name);
                                                    setShowFunnelMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                            >
                                                <Pencil size={14} /> Renomear funil
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Excluir o funil "${activeFunnel?.name}"?`)) {
                                                        deleteFunnel(activeFunnelId);
                                                    }
                                                    setShowFunnelMenu(false);
                                                }}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                            >
                                                <Trash2 size={14} /> Excluir funil
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Kanban Board ── */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden px-6 py-6 font-sans">
                {funnels.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                            <Plus size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Comece seu primeiro funil</h3>
                        <p className="text-sm text-gray-500 max-w-xs mb-6">Organize seus leads e acompanhe suas vendas de forma profissional.</p>
                        <button
                            onClick={() => setShowNewFunnel(true)}
                            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition shadow-lg shadow-purple-200"
                        >
                            Criar meu primeiro Funil
                        </button>
                    </div>
                ) : (
                    <div className="flex gap-5 h-full items-start">
                        {activeFunnel?.columns?.map((column) => (
                            <KanbanColumn
                                key={column.id}
                                column={column}
                                onAddCard={addCard}
                                onUpdateCard={updateCard}
                                onDeleteCard={deleteCard}
                                onDeleteColumn={deleteColumn}
                                onRenameColumn={renameColumn}
                                onMoveCard={moveCard}
                            />
                        ))}

                        {/* Add Column Button */}
                        {activeFunnelId && (
                            showNewColumn ? (
                                <div className="min-w-[300px] max-w-[300px] bg-white rounded-2xl p-4 shadow-sm border border-purple-200">
                                    <input
                                        value={newColumnTitle}
                                        onChange={(e) => setNewColumnTitle(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddColumn()}
                                        placeholder="Título da coluna..."
                                        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent mb-3"
                                        autoFocus
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleAddColumn}
                                            className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg font-medium hover:bg-purple-700 transition"
                                        >
                                            Adicionar coluna
                                        </button>
                                        <button
                                            onClick={() => { setShowNewColumn(false); setNewColumnTitle(''); }}
                                            className="p-2 text-gray-400 hover:text-gray-600 transition"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowNewColumn(true)}
                                    className="min-w-[280px] flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white/60 hover:bg-white border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-500 hover:text-purple-600 text-sm font-medium transition-all duration-200"
                                >
                                    <Plus size={18} />
                                    Adicionar coluna
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SalesFunnel;
