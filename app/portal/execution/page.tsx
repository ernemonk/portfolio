"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import * as api from "@/lib/trading-api";

interface Order {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "stop_limit";
  quantity: number;
  price?: number;
  stop_price?: number;
  filled_quantity: number;
  remaining_quantity: number;
  avg_fill_price?: number;
  status: "pending" | "partial" | "filled" | "cancelled" | "rejected";
  strategy: string;
  created_at: string;
  updated_at: string;
  time_in_force: "GTC" | "IOC" | "FOK" | "DAY";
  commission?: number;
}

interface Execution {
  id: string;
  order_id: string;
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  timestamp: string;
  exchange: string;
  commission: number;
  slippage: number;
  execution_quality: "excellent" | "good" | "fair" | "poor";
}

interface OrderBookLevel {
  price: number;
  size: number;
  orders: number;
}

interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  last_update: string;
}

interface TradingVenue {
  name: string;
  status: "connected" | "disconnected" | "degraded";
  latency: number;
  fill_rate: number;
  fees: {
    maker: number;
    taker: number;
  };
  supported_assets: string[];
}

interface NewOrder {
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop" | "stop_limit";
  quantity: number;
  price?: number;
  stop_price?: number;
  time_in_force: "GTC" | "IOC" | "FOK" | "DAY";
  strategy: string;
}

export default function ExecutionPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [orderBooks, setOrderBooks] = useState<Record<string, OrderBook>>({});
  const [tradingVenues, setTradingVenues] = useState<TradingVenue[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("BTC");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [newOrder, setNewOrder] = useState<NewOrder>({
    symbol: "BTC",
    side: "buy",
    type: "limit",
    quantity: 0,
    price: 0,
    time_in_force: "GTC",
    strategy: "Manual",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExecutionData();
    
    // Simulate real-time order book updates
    const interval = setInterval(() => {
      updateOrderBooks();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const loadExecutionData = async () => {
    try {
      setLoading(true);

      const mockOrders: Order[] = [
        {
          id: "ord-001",
          symbol: "BTC",
          side: "buy",
          type: "limit",
          quantity: 0.5,
          price: 68500,
          filled_quantity: 0.25,
          remaining_quantity: 0.25,
          avg_fill_price: 68480,
          status: "partial",
          strategy: "Momentum Strategy",
          created_at: "2024-03-15 14:30:00",
          updated_at: "2024-03-15 14:32:15",
          time_in_force: "GTC",
          commission: 12.50,
        },
        {
          id: "ord-002",
          symbol: "ETH",
          side: "sell",
          type: "market",
          quantity: 3.0,
          price: undefined,
          filled_quantity: 3.0,
          remaining_quantity: 0,
          avg_fill_price: 3425,
          status: "filled",
          strategy: "Mean Reversion",
          created_at: "2024-03-15 13:45:00",
          updated_at: "2024-03-15 13:45:05",
          time_in_force: "IOC",
          commission: 15.30,
        },
        {
          id: "ord-003",
          symbol: "SOL",
          side: "buy",
          type: "stop_limit",
          quantity: 20,
          price: 175,
          stop_price: 180,
          filled_quantity: 0,
          remaining_quantity: 20,
          status: "pending",
          strategy: "Breakout Strategy",
          created_at: "2024-03-15 12:20:00",
          updated_at: "2024-03-15 12:20:00",
          time_in_force: "GTC",
        },
        {
          id: "ord-004",
          symbol: "AAPL",
          side: "buy",
          type: "limit",
          quantity: 100,
          price: 180.50,
          filled_quantity: 100,
          remaining_quantity: 0,
          avg_fill_price: 180.45,
          status: "filled",
          strategy: "Tech Momentum",
          created_at: "2024-03-15 11:15:00",
          updated_at: "2024-03-15 11:16:30",
          time_in_force: "DAY",
          commission: 8.75,
        },
      ];

      const mockExecutions: Execution[] = [
        {
          id: "exec-001",
          order_id: "ord-001",
          symbol: "BTC",
          side: "buy",
          quantity: 0.25,
          price: 68480,
          timestamp: "2024-03-15 14:32:15",
          exchange: "Coinbase Pro",
          commission: 6.25,
          slippage: -0.029,
          execution_quality: "excellent",
        },
        {
          id: "exec-002",
          order_id: "ord-002",
          symbol: "ETH",
          side: "sell",
          quantity: 3.0,
          price: 3425,
          timestamp: "2024-03-15 13:45:05",
          exchange: "Kraken",
          commission: 15.30,
          slippage: 0.073,
          execution_quality: "good",
        },
        {
          id: "exec-003",
          order_id: "ord-004",
          symbol: "AAPL",
          side: "buy",
          quantity: 100,
          price: 180.45,
          timestamp: "2024-03-15 11:16:30",
          exchange: "NASDAQ",
          commission: 8.75,
          slippage: -0.028,
          execution_quality: "excellent",
        },
      ];

      const mockTradingVenues: TradingVenue[] = [
        {
          name: "Coinbase Pro",
          status: "connected",
          latency: 45,
          fill_rate: 98.5,
          fees: { maker: 0.005, taker: 0.005 },
          supported_assets: ["BTC", "ETH", "LTC", "ADA"],
        },
        {
          name: "Kraken",
          status: "connected",
          latency: 62,
          fill_rate: 97.8,
          fees: { maker: 0.0025, taker: 0.004 },
          supported_assets: ["BTC", "ETH", "XRP", "DOT"],
        },
        {
          name: "Binance",
          status: "degraded",
          latency: 180,
          fill_rate: 95.2,
          fees: { maker: 0.001, taker: 0.001 },
          supported_assets: ["BTC", "ETH", "BNB", "SOL"],
        },
        {
          name: "NASDAQ",
          status: "connected",
          latency: 25,
          fill_rate: 99.7,
          fees: { maker: 0.0005, taker: 0.0005 },
          supported_assets: ["AAPL", "MSFT", "GOOGL", "TSLA"],
        },
      ];

      setOrders(mockOrders);
      setExecutions(mockExecutions);
      setTradingVenues(mockTradingVenues);
      
      // Initialize order books
      updateOrderBooks();
    } catch (error) {
      console.error("Failed to load execution data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderBooks = () => {
    const symbols = ["BTC", "ETH", "SOL", "AAPL"];
    const updatedOrderBooks: Record<string, OrderBook> = {};

    symbols.forEach(symbol => {
      const basePrice = symbol === "BTC" ? 69000 : 
                       symbol === "ETH" ? 3400 : 
                       symbol === "SOL" ? 178 : 181;

      const bids: OrderBookLevel[] = Array.from({ length: 10 }, (_, i) => ({
        price: basePrice - (i * basePrice * 0.001),
        size: Math.random() * 10 + 1,
        orders: Math.floor(Math.random() * 5) + 1,
      }));

      const asks: OrderBookLevel[] = Array.from({ length: 10 }, (_, i) => ({
        price: basePrice + (i * basePrice * 0.001),
        size: Math.random() * 10 + 1,
        orders: Math.floor(Math.random() * 5) + 1,
      }));

      updatedOrderBooks[symbol] = {
        symbol,
        bids,
        asks,
        last_update: new Date().toISOString(),
      };
    });

    setOrderBooks(updatedOrderBooks);
  };

  const submitOrder = async () => {
    try {
      const order: Order = {
        id: `ord-${Date.now()}`,
        symbol: newOrder.symbol,
        side: newOrder.side,
        type: newOrder.type,
        quantity: newOrder.quantity,
        price: newOrder.price,
        stop_price: newOrder.stop_price,
        filled_quantity: 0,
        remaining_quantity: newOrder.quantity,
        status: "pending",
        strategy: newOrder.strategy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        time_in_force: newOrder.time_in_force,
      };

      setOrders([order, ...orders]);
      setShowNewOrder(false);
      setNewOrder({
        symbol: "BTC",
        side: "buy",
        type: "limit",
        quantity: 0,
        price: 0,
        time_in_force: "GTC",
        strategy: "Manual",
      });
    } catch (error) {
      console.error("Failed to submit order:", error);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: "cancelled" as const, updated_at: new Date().toISOString() }
          : order
      ));
    } catch (error) {
      console.error("Failed to cancel order:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentOrderBook = orderBooks[selectedSymbol];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Execution Center</h1>
          <p className="text-gray-400 mt-1">
            Order management and execution monitoring
          </p>
        </div>
        <button
          onClick={() => setShowNewOrder(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          New Order
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Book */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Order Book</h3>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="px-2 py-1 bg-gray-700 text-white rounded text-sm"
            >
              <option value="BTC">BTC</option>
              <option value="ETH">ETH</option>
              <option value="SOL">SOL</option>
              <option value="AAPL">AAPL</option>
            </select>
          </div>

          {currentOrderBook && (
            <div className="space-y-4">
              {/* Asks */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Asks</p>
                <div className="space-y-1">
                  {currentOrderBook.asks.slice(0, 5).reverse().map((ask, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-red-400 font-mono">${ask.price.toFixed(2)}</span>
                      <span className="text-gray-300 font-mono">{ask.size.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spread */}
              <div className="border-t border-gray-700 pt-2 pb-2">
                <div className="text-center">
                  <p className="text-gray-400 text-xs">Spread</p>
                  <p className="text-white font-mono text-sm">
                    ${(currentOrderBook.asks[0].price - currentOrderBook.bids[0].price).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Bids */}
              <div>
                <p className="text-gray-400 text-sm mb-2">Bids</p>
                <div className="space-y-1">
                  {currentOrderBook.bids.slice(0, 5).map((bid, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-green-400 font-mono">${bid.price.toFixed(2)}</span>
                      <span className="text-gray-300 font-mono">{bid.size.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Active Orders */}
        <Card className="p-4 lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4">Active Orders</h3>
          <div className="space-y-3">
            {orders.filter(order => order.status === "pending" || order.status === "partial").map((order) => (
              <div key={order.id} className="p-3 bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <Badge variant={order.side === "buy" ? "success" : "destructive"}>
                      {order.side.toUpperCase()}
                    </Badge>
                    <span className="text-white font-semibold">{order.symbol}</span>
                    <Badge variant="secondary">{order.type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      order.status === "pending" ? "warning" :
                      order.status === "partial" ? "default" : "success"
                    }>
                      {order.status}
                    </Badge>
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-400">Quantity</p>
                    <p className="text-white font-mono">{order.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Price</p>
                    <p className="text-white font-mono">
                      {order.price ? `$${order.price.toLocaleString()}` : "Market"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Filled</p>
                    <p className="text-white font-mono">
                      {order.filled_quantity} / {order.quantity}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Strategy</p>
                    <p className="text-white">{order.strategy}</p>
                  </div>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  Created: {order.created_at} | Updated: {order.updated_at}
                </div>
              </div>
            ))}

            {orders.filter(order => order.status === "pending" || order.status === "partial").length === 0 && (
              <p className="text-gray-400 text-center py-8">No active orders</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Executions */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Executions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">Time</th>
                <th className="text-left py-2 text-gray-400">Symbol</th>
                <th className="text-left py-2 text-gray-400">Side</th>
                <th className="text-right py-2 text-gray-400">Quantity</th>
                <th className="text-right py-2 text-gray-400">Price</th>
                <th className="text-left py-2 text-gray-400">Exchange</th>
                <th className="text-right py-2 text-gray-400">Commission</th>
                <th className="text-right py-2 text-gray-400">Slippage</th>
                <th className="text-center py-2 text-gray-400">Quality</th>
              </tr>
            </thead>
            <tbody>
              {executions.map((execution) => (
                <tr key={execution.id} className="border-b border-gray-800">
                  <td className="py-2 text-white">{execution.timestamp}</td>
                  <td className="py-2 text-white font-medium">{execution.symbol}</td>
                  <td className="py-2">
                    <Badge variant={execution.side === "buy" ? "success" : "destructive"} size="sm">
                      {execution.side.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="py-2 text-right text-white font-mono">{execution.quantity}</td>
                  <td className="py-2 text-right text-white font-mono">${execution.price.toLocaleString()}</td>
                  <td className="py-2 text-white">{execution.exchange}</td>
                  <td className="py-2 text-right text-white font-mono">${execution.commission}</td>
                  <td className="py-2 text-right font-mono">
                    <span className={execution.slippage >= 0 ? "text-red-400" : "text-green-400"}>
                      {execution.slippage >= 0 ? "+" : ""}{(execution.slippage * 100).toFixed(3)}%
                    </span>
                  </td>
                  <td className="py-2 text-center">
                    <Badge variant={
                      execution.execution_quality === "excellent" ? "success" :
                      execution.execution_quality === "good" ? "default" :
                      execution.execution_quality === "fair" ? "warning" : "destructive"
                    } size="sm">
                      {execution.execution_quality}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Trading Venues Status */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Trading Venues</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tradingVenues.map((venue) => (
            <div key={venue.name} className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-white font-medium">{venue.name}</h4>
                <div className={`w-3 h-3 rounded-full ${
                  venue.status === "connected" ? "bg-green-500" :
                  venue.status === "degraded" ? "bg-yellow-500" : "bg-red-500"
                }`}></div>
              </div>

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Latency</span>
                  <span className="text-white font-mono">{venue.latency}ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fill Rate</span>
                  <span className="text-white font-mono">{venue.fill_rate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Maker Fee</span>
                  <span className="text-white font-mono">{(venue.fees.maker * 100).toFixed(3)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Taker Fee</span>
                  <span className="text-white font-mono">{(venue.fees.taker * 100).toFixed(3)}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* New Order Modal */}
      {showNewOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">New Order</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Symbol</label>
                <select
                  value={newOrder.symbol}
                  onChange={(e) => setNewOrder({ ...newOrder, symbol: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                >
                  <option value="BTC">BTC</option>
                  <option value="ETH">ETH</option>
                  <option value="SOL">SOL</option>
                  <option value="AAPL">AAPL</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Side</label>
                  <select
                    value={newOrder.side}
                    onChange={(e) => setNewOrder({ ...newOrder, side: e.target.value as "buy" | "sell" })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  >
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    value={newOrder.type}
                    onChange={(e) => setNewOrder({ ...newOrder, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  >
                    <option value="market">Market</option>
                    <option value="limit">Limit</option>
                    <option value="stop">Stop</option>
                    <option value="stop_limit">Stop Limit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Quantity</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newOrder.quantity || ""}
                  onChange={(e) => setNewOrder({ ...newOrder, quantity: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                />
              </div>

              {(newOrder.type === "limit" || newOrder.type === "stop_limit") && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrder.price || ""}
                    onChange={(e) => setNewOrder({ ...newOrder, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  />
                </div>
              )}

              {(newOrder.type === "stop" || newOrder.type === "stop_limit") && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Stop Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newOrder.stop_price || ""}
                    onChange={(e) => setNewOrder({ ...newOrder, stop_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Time in Force</label>
                  <select
                    value={newOrder.time_in_force}
                    onChange={(e) => setNewOrder({ ...newOrder, time_in_force: e.target.value as any })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  >
                    <option value="GTC">GTC (Good Till Cancel)</option>
                    <option value="IOC">IOC (Immediate or Cancel)</option>
                    <option value="FOK">FOK (Fill or Kill)</option>
                    <option value="DAY">DAY</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Strategy</label>
                  <input
                    type="text"
                    value={newOrder.strategy}
                    onChange={(e) => setNewOrder({ ...newOrder, strategy: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewOrder(false)}
                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitOrder}
                disabled={!newOrder.quantity || (newOrder.type !== "market" && !newOrder.price)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Order
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}